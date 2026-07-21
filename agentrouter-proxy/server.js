const http = require('http');
const https = require('https');

const PORT = process.env.PROXY_PORT || 8318;
const TARGET_HOST = 'agentrouter.org';

const server = http.createServer((clientReq, clientRes) => {
    // Forward the request to agentrouter.org
    const options = {
        hostname: TARGET_HOST,
        port: 443,
        path: clientReq.url,
        method: clientReq.method,
        headers: {
            ...clientReq.headers,
            // Overwrite/Spoof headers to bypass WAF client verification
            'host': TARGET_HOST,
            'originator': 'codex_cli_rs',
            'user-agent': 'codex_cli_rs/0.101.0 (Mac OS 26.0.1; arm64) Apple_Terminal/464',
            'version': '0.101.0'
        }
    };

    // Remove client-specific transfer-encoding if present to let Node handle stream encapsulation
    delete options.headers['transfer-encoding'];
    // Remove accept-encoding to prevent upstream compression (ensures plain-text parsing)
    delete options.headers['accept-encoding'];

    const targetReq = https.request(options, (targetRes) => {
        // Write status and headers back to client
        clientRes.writeHead(targetRes.statusCode, targetRes.headers);
        
        let buffer = '';

        targetRes.on('data', (chunk) => {
            buffer += chunk.toString();
            let lines = buffer.split('\n');
            // Keep the last partial line in the buffer
            buffer = lines.pop();

            for (let line of lines) {
                if (line.trim().startsWith('data:')) {
                    const dataStr = line.slice(5).trim();
                    if (dataStr === '[DONE]') {
                        clientRes.write(line + '\n');
                    } else {
                        try {
                            const parsed = JSON.parse(dataStr);
                            // Filter out AgentRouter-specific custom billing summaries which crash Vercel AI SDK
                            if (parsed && parsed.object === 'billing.summary') {
                                continue;
                            }
                            clientRes.write(line + '\n');
                        } catch (e) {
                            // If parsing fails, forward the line anyway to prevent swallowing valid text
                            clientRes.write(line + '\n');
                        }
                    }
                } else {
                    clientRes.write(line + '\n');
                }
            }
        });

        targetRes.on('end', () => {
            if (buffer) {
                clientRes.write(buffer);
            }
            clientRes.end();
        });
    });

    targetReq.on('error', (err) => {
        console.error('Proxy request error:', err);
        clientRes.writeHead(500, { 'Content-Type': 'text/plain' });
        clientRes.end('Proxy Error: ' + err.message);
    });

    // Pipe incoming client request body to target request
    clientReq.pipe(targetReq);
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`AgentRouter Proxy running on http://127.0.0.1:${PORT}`);
});
