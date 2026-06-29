# SmartCase AI
### One Case. One Record. Zero Duplication.  
SmartCase AI is an AI-powered police case workflow management system designed to reduce repetitive documentation during criminal investigations.
The platform enables officers to register FIRs, maintain investigation diaries, and automatically generate professional investigation reports using AI.
The objective is to create a centralized case management workflow where information is entered once and reused throughout the investigation lifecycle.


## Problem Statement
Police officers often spend significant time repeatedly entering the same information across multiple documents.

This results in:
* Duplicate data entry
* Inconsistent records
* Increased paperwork
* Delayed report preparation
* Investigation inefficiencies
SmartCase AI addresses these challenges by providing a unified case record and AI-assisted document generation.

---

## MVP 1 Features

### FIR Management
* Create FIR records
* Edit FIR details
* View case information

### Case Dashboard
* Case overview
* Status tracking
* Recent activity

### IPC / Legal Section Suggestion
DescriptionAI suggests relevant IPC/legal sections based on case description

AI Investigation Summary
*DescriptionGenerate concise investigation summaries.
* Crime overview
* Timeline
* Risk indicators

### Investigation Diary
* Add diary entries
* Maintain investigation timeline
* Track case progress

### AI Report Generation

Generate:
* Case Summary
* Investigation Report
using Google Gemini AI.

### PDF Export
* Download generated reports
* Maintain digital records

---

## Technology Stack

### Frontend
* Next.js
* TypeScript
* Tailwind CSS
* ShadCN UI
* Zustand

### Backend
* Node.js
* Express.js

### Database
* PostgreSQL
  
### AI Integration
* Google Gemini API

### Document Generation
* PDFKit

## Project Architecture
Frontend (Next.js)
↓
Express API Server
↓
PostgreSQL Database
↓
Gemini AI Services
↓
PDF Generation Engine


## Database Schema
Core Entities:
* Users
* FIR Cases
* Diary Entries
* Generated Reports


## Future Scope
* Evidence Management
* Witness Management
* Legal Section Recommendation
* Multilingual Support
* Audit Logging
* Court Document Automation
* Mobile Application


## Mission
Reduce repetitive police paperwork through centralized case management and AI-powered report generation.


## Status
MVP 1 Prototype – Under Development

## License
MIT License
