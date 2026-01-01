# 🚌 Kadamba Transport Visualizer

A modern, interactive web application to visualize the **Kadamba Transport Corporation (KTC)** bus network in Goa using GTFS data.

## ✨ Key Features

*   **🗺️ Interactive Map:** Explore the entire bus network on an OpenStreetMap interface.
*   **📍 Route Visualization:** Highlights specific bus routes with a distinct "road-like" visual style.
*   **🔍 Advanced Search:** Filter routes by **Route Name** or **Intermediate Stops**.
*   **⏱️ Timetable & Estimates:** View arrival times for every stop on a trip with smart time interpolation.
*   **🔗 Deep Linking:** Share specific routes with a unique URL.
*   **🚀 Client-Side Only:** Fast and lightweight—all GTFS data parsing happens locally in your browser.

## 🛠️ Tech Stack

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS v4
*   **Mapping:** Leaflet & React-Leaflet
*   **Data Processing:** Papaparse

## 🚀 Deployment (GitHub Pages)

This project is configured to deploy using the `docs/` folder.

1.  **Build the project:**
    ```bash
    npm run build
    ```
2.  **Push to GitHub.**
3.  **On GitHub:** Go to **Settings > Pages**.
4.  **Build and deployment:** Under "Branch", select `main` (or your default branch) and the `/docs` folder.
5.  **Save.** Your app will be live at `https://your-username.github.io/your-repo-name/`.

## 💻 Local Development

1.  `npm install`
2.  `npm run dev`