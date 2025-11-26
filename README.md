# Uptime Pulse 🚀

**Uptime Pulse** is a highly optimized URL and API monitoring platform inspired by services like Uptime Robot. It allows users to monitor the uptime of their APIs and websites with a simple, intuitive dashboard.  

---

## 🌟 Features

- **User Authentication**: Secure login system to manage your monitored APIs.
- **Add / Update / Delete APIs**: Easily manage the URLs you want to monitor.
- **Real-Time Status Monitoring**: View the current status (`UP` / `DOWN`) and response time of each API.
- **Ping APIs Automatically**: Keep APIs awake by sending requests at regular intervals (every 5–10 minutes) using Node.js cron jobs.
- **Search & Filter**: Quickly find APIs by name or URL.
- **Instant Updates**: Changes (add/update/delete) are reflected immediately on the dashboard without page refresh.
- **Responsive & Modern UI**: Clean, mobile-friendly interface built with React and TailwindCSS.
- **Smooth UX**: Loading animations and seamless interactions for a professional feel.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Next.js, TailwindCSS, TypeScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT-based authentication (Access & Refresh tokens)
- **Cron Jobs**: Node.js cron functions to automatically ping APIs
- **Notifications**: Toast notifications with Sonner
- **Icons & UI**: Lucide React icons, custom UI components

---

## ⚡ How It Works

1. User logs in to their dashboard.  
2. User can add APIs they want to monitor by providing a URL and optional endpoint.  
3. The system **pings each API immediately** and then continues to ping at regular intervals to check uptime and response time.  
4. API status is displayed in real-time, with visual indicators (`UP` / `DOWN`).  
5. Any changes (add/update/delete) are instantly reflected in the dashboard for a smooth experience.  

---

## 📸 Screenshots

![Dashboard Screenshot](./screenshots/dashboard.png)  
*Clean and interactive dashboard view showing API status and response times.*

---

## 🚀 Installation

1. Clone the repository:

```bash
git clone https://github.com/mzeeshanh-dev/uptimepulse.git
cd uptime-pulse

Install dependencies:
npm install

Create a .env file based on .env.example:

MONGO_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRE=1h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRE=7d
PORT=5000


Run the development server:

npm run dev

📦 Build for Production
npm run build
npm start

🔒 Security

JWT-based authentication for secure API access.

Passwords hashed with bcrypt.

Environment variables stored securely in .env.

🌐 Live Demo
https://uptime-pulse-zeeshan.vercel.app/

💡 Future Improvements

Email/SMS notifications when an API goes down.

Customizable ping intervals for each API.

Analytics & history logs for uptime statistics.

Mobile app version using React Native.

✨ Conclusion

Uptime Pulse provides a lightweight, optimized, and user-friendly alternative to other uptime monitoring services. Its real-time updates, smooth UX, and modern stack make it perfect for developers and teams who want to keep their APIs awake and monitored efficiently.


---

If you want, I can also **create a short, catchy “GitHub README front section”** with badges, live demo link, and highlights — that one usually **makes the project look really impressive at first glance**.  

Do you want me to do that?
