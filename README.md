# 🚀 AutoBiz AI – Smart Invoice Intelligence System

## 🧠 Overview

AutoBiz AI is an intelligent financial automation platform designed to help businesses manage invoices efficiently using AI and OCR.

It extracts, verifies, analyzes, and generates insights from invoices to reduce manual effort, prevent errors, and improve financial decision-making.

---

## 🎯 Problem Statement

Small businesses face challenges such as:

- Manual invoice processing  
- Delayed payments  
- Tax calculation errors  
- Lack of financial insights  

---

## 💡 Solution

AutoBiz AI automates invoice handling by:

- 📄 Extracting invoice data using OCR  
- 🤖 Using AI to understand and structure data  
- ✅ Verifying GST & tax calculations  
- 📊 Providing analytics dashboard  
- 📧 Generating professional business emails  

---

## 🔥 Key Features

### 📄 Invoice OCR Processing
- Upload PDF/Image invoices  
- Extract key fields like:
  - Invoice Number
  - Date
  - Customer
  - Amount
  - Tax

---

### 🧾 GST Verification Engine
- Validates tax calculations  
- Detects mismatches  
- Ensures compliance  

---

### ⚠️ Fraud Detection (Smart Logic)
- Detects anomalies in invoices  
- Flags suspicious transactions  

---

### 📊 Analytics Dashboard
- Visual insights on:
  - Spending trends  
  - Invoice volume  
  - Financial patterns  

---

### 📧 AI Email Generator
- Generates professional emails:
  - Payment reminders  
  - Invoice communication  
- Includes fallback system if AI is unavailable  

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
- OCR.Space API (Text Extraction)
- Google Gemini AI (Email + AI Processing)

---

## 🧱 Architecture
Client (React)
↓
Server (Node.js / Express)
↓
OCR API → Extract Text
↓
AI / Fallback Engine
↓
MongoDB (Storage)


---

## 🚀 Deployment

### 🌐 Frontend
- Vercel

### ⚙️ Backend
- Render

### 🗄️ Database
- MongoDB Atlas

---

## ⚠️ Reliability Design

- Fallback system ensures:
  - App works even if AI fails  
- Smart regex-based extraction  
- Error-handling for API failures  

---

## 🧪 How to Run Locally

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo

2️⃣ Setup Backend
cd server
npm install


Create .env file:

PORT=5000
MONGO_URI=your_mongodb_uri
OCR_API_KEY=your_ocr_key
AI_API_KEY=your_gemini_key

Run server:

npm run dev

3️⃣ Setup Frontend

cd client
npm install
npm run dev


🧠 Innovation Highlights
AI + Rule-based hybrid system
Works even without AI (fallback logic)
Real-world financial problem solving
Scalable architecture


🎯 Future Scope
Payment gateway integration
Automated invoice reminders
Advanced fraud detection using ML
Multi-user role-based system


👨‍💻 Team
Prashanth Gouda
Teammate 1
Teammate 2

🏆 Conclusion

AutoBiz AI transforms invoice management into an intelligent, automated, and reliable system, enabling businesses to make smarter financial decisions.