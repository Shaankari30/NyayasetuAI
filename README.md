# ⚖️ NyayaSetu AI

> **Democratizing Legal Access for Every Indian Citizen**  
> *"Understand Your Rights. Access Justice. In Your Language."*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://nyayasetu-ai.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🎯 Problem Statement

Millions of Indian citizens — particularly in rural and semi-urban areas — lack access to basic legal guidance due to:

- **Exorbitant costs** of professional legal consultation
- **Language barriers** — legal documents only in English
- **Geographic exclusion** — legal services concentrated in cities
- **Lack of awareness** — citizens unknowingly sign exploitative contracts

---

## 💡 Solution: NyayaSetu AI

NyayaSetu AI is a multilingual AI-powered legal assistant that provides:

1. **Legal Q&A Chatbot** — Ask questions about your rights in your language (English, Hindi, Telugu, Tamil, Bengali, Marathi) and receive clear, actionable guidance grounded in Indian law (BNS, Consumer Protection Act, Rent Control Acts, Labour Laws)

2. **Contract Risk Analyzer** — Upload rental agreements, employment contracts, or consumer notices as PDF/text and instantly get a risk analysis identifying unfair clauses with plain-language explanations

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS |
| **Backend** | Next.js API Routes (serverless) |
| **AI Model** | Groq API — Llama 3.3 70B Versatile |
| **PDF Parsing** | `pdf-parse` |
| **Deployment** | Vercel |

---

## 🏗️ Architecture

```
User (Browser)
      │
      ▼
Next.js Frontend (React)
      │
      ├── /api/chat        ──► Groq Llama 3.3 70B
      │   (Legal Q&A)              │
      │                    Indian Law Corpus (System Prompt)
      │
      └── /api/analyze     ──► pdf-parse ──► Groq Llama 3.3 70B
          (Contract scan)         │                  │
                            Extract text      Risk Classification
                                              (High/Medium/Low)
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/nyayasetu-ai.git
cd nyayasetu-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your GROQ_API_KEY

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
```

---

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variable
vercel env add GROQ_API_KEY
```

Or deploy with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/nyayasetu-ai&env=GROQ_API_KEY)

---

## 🌍 Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | en | ✅ Full support |
| Hindi (हिंदी) | hi | ✅ Full support |
| Telugu (తెలుగు) | te | ✅ Full support |
| Tamil (தமிழ்) | ta | ✅ Full support |
| Bengali (বাংলা) | bn | ✅ Full support |
| Marathi (मराठी) | mr | ✅ Full support |

---

## ⚖️ Legal Domains Covered

- **Tenant Rights** — Security deposits, eviction, rent increases under Rent Control Acts
- **Labour Law** — Wage recovery, wrongful termination under Payment of Wages Act & BNS
- **Consumer Protection** — Defective products, service disputes under Consumer Protection Act 2019
- **Family Law** — General guidance on marriage, inheritance, property
- **Contract Review** — Rental agreements, employment contracts, consumer notices

---

## 🔒 Disclaimers

- NyayaSetu AI provides **general legal information**, not formal legal advice
- For serious legal matters, consult a qualified advocate
- Free legal aid is available at your **District Legal Services Authority (DLSA)**

---

## 🗺️ Roadmap

- [x] Multilingual legal Q&A chatbot
- [x] PDF contract risk analyzer
- [ ] BHASHINI API integration for native voice input/output
- [ ] RAG pipeline with Indian Kanoon corpus
- [ ] Offline support via PWA
- [ ] CSC (Common Service Centre) integration for rural access
- [ ] WhatsApp bot interface

---

## 👩‍💻 Built By

**Shaankari** — Final year B.Tech AI/ML student  
*Bharat Academix CodeQuest Hackathon 2026*

---

## 📄 License

MIT License — see [LICENSE](LICENSE)
