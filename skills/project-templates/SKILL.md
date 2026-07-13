---
name: project-templates
description: "Manage and bootstrap project-specific instructions and guidelines for Web, Python, Mobile, Enterprise Backend, DevOps, and OSS Libraries."
---

# Project Templates Skill

This skill provides a set of structured developer instructions and guidelines for different kinds of projects. It includes a utility script to copy these templates as a baseline instruction file (`CLAUDE.md` or `GEMINI.md`) into your target workspace.

## Available Templates
- **web-app**: Next.js 14, Zustand, Prisma, React Query frontend/backend stack.
- **python-ds**: Python Customer Analytics Pipeline (Data science/ML pipeline).
- **react-native**: React Native with Redux Toolkit and React Navigation mobile app stack.
- **enterprise-backend**: Spring Boot 3.1 with Java 17 payment microservice.
- **devops-infra**: DevOps Infrastructure-as-Code with Terraform, Ansible, and Kubernetes.
- **oss-library**: Open-source library packaging guidelines and release flow.

## How to Apply a Template
You can run the PowerShell script to copy any of the templates to a target folder:

```powershell
& "C:\Users\niloy\Documents\opencode-setup\skills\project-templates\scripts\apply-template.ps1" -Template <template-name> -Target <target-path> -FileName <CLAUDE.md|GEMINI.md>
```

### Examples:
- Apply the Web App template to the current directory:
  ```powershell
  & "C:\Users\niloy\Documents\opencode-setup\skills\project-templates\scripts\apply-template.ps1" -Template web-app
  ```
- Apply the DevOps Infrastructure template to a specific subfolder as `GEMINI.md`:
  ```powershell
  & "C:\Users\niloy\Documents\opencode-setup\skills\project-templates\scripts\apply-template.ps1" -Template devops-infra -Target .\infra-repo -FileName GEMINI.md
  ```
