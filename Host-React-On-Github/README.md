# Deploying a React App to GitHub Pages

This guide explains how to deploy a React application to GitHub Pages using `gh-pages`.

## Prerequisites
Ensure you have:
- A GitHub account
- Node.js and npm installed on your computer
- A React project ready for deployment

---

## 📺 YouTube Tutorial
Watch the full tutorial on YouTube:
[https://youtu.be/LKxL-wlwTOw](https://youtu.be/LKxL-wlwTOw)

---

## 1. Create an Empty Repository on GitHub
1. Go to [GitHub](https://github.com/) and create a new repository named **deploy-react-git**.
2. Do **not** initialize with a README, `.gitignore`, or license.

---

## 2. Clone the Empty Repository
Use an access token (recommended) or SSH to clone your new repository:
```sh
 git clone https://github.com/<your-github-username>/deploy-react-git.git
```

Navigate into the cloned repo:
```sh
 cd deploy-react-git
```

Copy your React project files into this directory.

🔹 **Need help with access tokens?** Watch this tutorial:  
[How to Use GitHub Access Tokens](https://www.youtube.com/watch?v=EX5-YlAXD3Q)

---

## 3. Install Dependencies
Run the following command to install all dependencies:
```sh
 npm install
```
The only non-default packages used in this project are:
- `sass` (for SCSS styling)
- `axios` (for HTTP requests)

If not installed, install them manually:
```sh
 npm install sass axios
```

---

## 4. Install GitHub Pages Package
Install `gh-pages` as a development dependency:
```sh
 npm install gh-pages --save-dev
```

---

## 5. Update `package.json`

### Add the `homepage` field
Inside `package.json`, add the following line:
```json
"homepage": "https://<your-github-username>.github.io/deploy-react-git",
```

### Add Deployment Scripts
Update the `scripts` section in `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

---

## 6. Push Project to GitHub
Run the following commands to push your project to GitHub:
```sh
 git init
 git add .
 git commit -m "First commit"
 git branch -M main
 git remote add origin https://github.com/<your-github-username>/deploy-react-git.git
 git push -u origin main
```

---

## 7. Deploy to GitHub Pages
Run the following command:
```sh
 npm run deploy
```
This will:
- Create a `gh-pages` branch.
- Build and deploy your project to GitHub Pages.

---

## 8. Enable GitHub Pages
1. Go to **Repository Settings > Pages**
2. Under **Branch**, select `gh-pages`
3. Click **Save**
4. After a few minutes, your site will be live at:
```
https://<your-github-username>.github.io/deploy-react-git/
```

---

## 9. (Optional) Automate Deployments
Each time you make changes, update your repository and redeploy:
```sh
 git add .
 git commit -m "Updated project"
 git push origin main
 npm run deploy
```
This ensures your site stays up to date with your latest changes.

---

## 🔗 Share This Guide

📢 **Copy this guide link to share with a colleague or friend:**
```html
https://github.com/chrisHalogen/HID-Tutorials/tree/main/Host-React-On-Github
```

---

## 🎉 Support Us!
If this guide was helpful, please support us by:

✅ Liking the video: [https://youtu.be/LKxL-wlwTOw](https://youtu.be/LKxL-wlwTOw)  
✅ Subscribing to the channel: [https://www.youtube.com/@halogenius-ideas](https://www.youtube.com/@halogenius-ideas)  
✅ Sharing it on your social platforms  
Thank you! 🚀
