# 🚀 AutoBiz AI – Intelligent Invoice Intelligence System

> Transforming invoice processing into smart financial decision-making using AI, OCR, and analytics.

---

## 🌟 Project Highlights

- 📄 OCR-based invoice data extraction  
- 🤖 AI-powered email generation  
- ✅ GST & tax verification engine  
- ⚠ Fraud & anomaly detection system  
- 📊 Analytics dashboard with insights  
- 💬 Smart chatbot assistant (GhostTracker AI)  
- 🔁 Fallback system for AI reliability  

---

## 🧠 Problem Statement

Small businesses and finance teams face:

- Manual invoice processing  
- Tax calculation errors  
- Delayed payments  
- Lack of financial visibility  

---

## 💡 Solution

AutoBiz AI automates invoice workflows by:

- Extracting invoice data using OCR  
- Structuring and validating financial data  
- Detecting anomalies and tax mismatches  
- Generating professional communication emails  
- Providing analytics for decision-making  

---

## 📸 Screenshots

### 📊 Dashboard
![Dashboard](./assets/dashboard.png)

---

### 📈 Analytics
![Analytics](./assets/analytics.png)

---

### 💬 AI Chatbot (GhostTracker)
![Chatbot](./assets/chatbot.png)

---

### 📄 Invoice Processing
![Invoice](./assets/invoice.png)

---

## 🛠️ Tech Stack

### Frontend
- React.js  
- Tailwind CSS  
- Framer Motion  

### Backend
- Node.js  
- Express.js  

### Database
- MongoDB Atlas  

### APIs
- OCR.Space API  
- Google Gemini AI  

---

## ⚙️ System Architecture

Client (React UI)
↓
Node.js Server (API Layer)
↓
OCR Engine → Extract Text
↓
AI Engine / Fallback Logic
↓
MongoDB (Storage)




---

## 🔍 Key Features

### 📄 Invoice OCR Engine
- Upload invoice (PDF/Image)
- Extract:
  - Invoice number
  - Customer
  - Amount
  - Tax

---

### ✅ GST Verification System
- Validates tax calculations  
- Detects mismatches  
- Ensures financial accuracy  

---

### ⚠ Fraud Detection Logic
- Flags suspicious invoices  
- Detects inconsistencies  
- Provides risk indication  

---

### 📧 AI Email Generator
- Generates professional business emails  
- Payment reminders & communication  
- Includes fallback when AI is unavailable  

---

### 📊 Analytics Dashboard
- Visual insights  
- Financial trends  
- Invoice tracking  

---

### 💬 GhostTracker AI Chatbot
- Interactive assistant  
- Helps understand invoice insights  
- Enhances user experience  

---

## 🔁 Reliability & Robustness

- Fallback system ensures:
  - App works even if AI APIs fail  
- Error-handling for external APIs  
- Smart regex-based extraction  

---

## 🚀 How to Run Locally

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Prashanth80888/visualiza.git
cd visualiza


2️⃣ Backend Setup
cd server
npm install


Create .env:
PORT=5000
MONGO_URI=your_mongodb_url
OCR_API_KEY=your_ocr_key
AI_API_KEY=your_gemini_key


Run:
npm run dev

3️⃣ Frontend Setup
cd client
npm install
npm run dev


🧠 Innovation Highlights
Hybrid AI + rule-based system
Works even without AI (fallback logic)
Real-world financial automation
Scalable architecture

🎯 Future Scope
Payment gateway integration
Automated reminders
Advanced ML-based fraud detection
Multi-user role management

👨‍💻 Team
Prashanth Gouda
Team Members

🏆 Conclusion

AutoBiz AI is not just an invoice processor —
it is a financial intelligence platform that enables smarter, faster, and more reliable business decisions.