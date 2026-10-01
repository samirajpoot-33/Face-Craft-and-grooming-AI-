
# FaceCraft – AI-Powered Grooming & Beauty Assistant

**FaceCraft** is a web-based AI grooming and beauty application that combines **Machine Learning, Computer Vision, Virtual Try-On, and personalized recommendations** to help users understand their facial and skin characteristics and make informed grooming and skincare choices.

The system analyzes uploaded facial images to detect **skin issues, skin type, and face shape**, then provides personalized product recommendations. It also provides AI-powered **hairstyle swapping, virtual makeup try-on, chatbot assistance, reminders, premium memberships, and social sharing**.

## 1. 🤖 AI & Machine Learning Modules

FaceCraft integrates multiple AI-powered modules for personalized facial and grooming analysis:

* **Skin Issue Detection**

  * Acne detection
  * Blackhead detection
  * Wrinkle detection
  * Pore detection
  * Dark-spot/skin-imperfection detection
* **Skin Type Classification**

  * Oily
  * Dry
  * Normal
  * Combination
* **Face Shape Detection**

  * Oval
  * Round
  * Oblong
  * Heart
  * Square and other supported categories
* **AI Hairstyle Virtual Try-On**

  * Male and female hairstyle transformation
  * Virtual hairstyle visualization
* **Virtual Makeup Try-On**

  * AI-assisted makeup visualization for female users
* **Personalized Product Recommendation**

  * Recommends skincare/grooming products based on detected skin characteristics and issues
* **AI Chatbot**

  * Provides grooming and skincare assistance through conversational interaction

  <img width="1600" height="792" alt="WhatsApp Image 2026-10-01 at 4 16 38 PM" src="https://github.com/user-attachments/assets/b118caa0-c580-4ba3-9386-27b48211475d" />


## 2. 🧠 Models & AI Technologies

The project uses **Computer Vision and Machine Learning techniques** to process facial images and generate personalized results.

### Machine Learning / Computer Vision

* Image classification for **skin type and face shape**
* Object/region detection for **skin issues**
* Facial landmark detection for identifying facial regions
* Image preprocessing and feature extraction
* Facial analysis using **OpenCV / MediaPipe-style landmark processing**
* Deep Learning models for image-based predictions
* AI-based image generation/manipulation for **virtual hairstyle and makeup try-on**
* Recommendation logic based on ML analysis results

### AI Pipeline

```text
User Uploads Facial Image
          ↓
Image Preprocessing
          ↓
Face Detection & Facial Landmarks
          ↓
 ┌────────┼────────────┐
 ↓        ↓            ↓
Skin     Face         Skin
Issues   Shape        Type
 ↓        ↓            ↓
 └────────┼────────────┘
          ↓
Personalized Analysis
          ↓
Product Recommendations
          ↓
Grooming Assistance / Virtual Try-On
```

<img width="1600" height="789" alt="WhatsApp Image 2026-10-01 at 4 16 38 PM (1)" src="https://github.com/user-attachments/assets/33dbd89a-05e0-4d70-80ef-116e74d4cde2" />


## 3. 💻 Technologies & Development Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Responsive Web Design
* Interactive UI components

### Backend

* Python
* REST APIs
* Authentication & authorization
* Server-side business logic
* Error handling and validation

### AI / Computer Vision

* Python-based Machine Learning
* OpenCV
* MediaPipe / facial landmark technologies
* Deep Learning / image classification
* Image processing
* AI image generation/manipulation

### Database & Storage

* **MySQL**
* User accounts and profiles
* Analysis reports
* AI prediction results
* Product information
* Membership/subscription records
* Application data and system records

### Development Tools

* Git & GitHub
* VS Code
* Python virtual environments
* API testing/development tools

> **Note:** In the final README, list the exact ML frameworks/models you actually used (for example, TensorFlow, PyTorch, YOLO, CNN, etc.) rather than claiming technologies that aren't part of your implementation.

## 4. 🔐 Application & System Modules

FaceCraft is designed as a complete web application rather than only an ML model.

| Module                                  | Functionality                                                 |
| --------------------------------------- | ------------------------------------------------------------- |
| **Authentication & Account Management** | Registration, login, authentication and account security      |
| **Profile Management**                  | Manage personal profile and grooming preferences              |
| **AI Skin Analysis**                    | Detect skin issues and classify skin type                     |
| **Face Shape Analysis**                 | Analyze facial structure and determine face shape             |
| **Product Recommendation**              | Recommend products according to analysis results              |
| **Virtual Hairstyle Try-On**            | Preview hairstyles using AI                                   |
| **Virtual Makeup Try-On**               | Experiment with virtual makeup                                |
| **AI Chatbot**                          | Interactive grooming assistance                               |
| **Notifications & Reminders**           | Skincare/grooming reminders and notifications                 |
| **Payment & Membership**                | Premium features and credit-based services                    |
| **Admin Panel**                         | Manage users, reports, products and application data          |
| **Reports & History**                   | Store and retrieve previous analysis results                  |
| **Social Sharing**                      | Share virtual try-on and analysis results                     |
| **Error Handling**                      | Validation, exceptions and application-level error management |
| **Database & Storage**                  | Persistent storage of application and user records            |

## 5. 🚀 Key Features & Engineering Highlights

FaceCraft demonstrates full-stack development combined with **AI/ML and Computer Vision**.

### Key Highlights

* 🧠 **AI-powered facial and skin analysis**
* 🔍 Automated detection of multiple skin issues
* 👤 Face-shape classification
* 🧴 Personalized skincare product recommendations
* 💇 AI hairstyle virtual try-on for male and female users
* 💄 Virtual makeup try-on
* 💬 AI grooming assistant chatbot
* 🔐 Secure user authentication and profile management
* 👨‍💼 Dedicated admin dashboard
* 📊 Persistent analysis reports and user history
* 🔔 Notification and reminder system
* 💳 Premium membership and credit/payment system
* 📱 Social media sharing functionality
* 🗄️ MySQL-based data management
* ⚠️ Application-wide error handling and validation
* 🔄 Integration of multiple AI services into a single web platform





<img width="1600" height="792" alt="WhatsApp Image 2026-10-01 at 4 16 38 PM" src="https://github.com/user-attachments/assets/a17a5888-7f25-4d60-a76c-ae094a00843c" />
