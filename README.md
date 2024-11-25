<h1 align="center">
     📡 BahnAPI-AngularApp ~ Learn to work with APIs
</h1>

<p align="center">
  <i align="center">Learn to work with API-REST Services in Typescript.<br />Developed using Angular with an HTML-Stack.</i>

  ![image](https://i.imgur.com/GFax1ym.png)

</p>

<h4 align="center">
  <a href="https://angular.dev/">
    <img src="https://img.shields.io/badge/version-Angular_18-27ae60?style=for-the-badge" alt="php version" style="height: 25px;">
  </a>
  <a href="https://developers.deutschebahn.com/db-api-marketplace/apis/frontpage">
    <img src="https://img.shields.io/badge/API_Service-Bahn_API-2980b9?style=for-the-badge" alt="php version" style="height: 25px;">
  </a>
  <a href="https://discord.gg/bl4cklist">
    <img src="https://img.shields.io/discord/616655040614236160?style=for-the-badge&logo=discord&label=Discord&color=%237289da" alt="discord server" style="height: 25px;">
  </a>
  <br>
</h4>

## 🗯️ Introduction
› This project is centered around the development of a user-friendly website. The website was crafted using HTML, CSS and TypeScript (JavaScript), which are some of the most powerful and widely-used languages in web development. 

🤔 - The <strong>primary function</strong> of this website is to have a small website/web app at the end where a user can display the arrival and departure times of a desired station. It should also show whether there is an elevator at the desired station.

› This project was developed by Yannic Drews & Yanic Döpner for a project work in their training as IT specialists for application development - some parts of the project are on german because that's the language that was specified for the project work.

## 🧮 Features
› `BahnAPI-AngularApp` provides a set of fundamental features that can assist you in handling APIs in typescript, thereby facilitating your learning process on how to manage them effectively. In our small project we used the **[BahnAPI](https://developers.deutschebahn.com/db-api-marketplace/apis/frontpage)** as example.
<br />

It supports following <strong>features</strong>:
<ul>
  <li>📚 <strong>Simple Caching-System</strong>: Don't make new API requests on page refresh.</li>
  <li>📡 <strong>Table-Data Loader</strong>: While the table data is loading, a endless GIF will be shown.</li>
  <li>📛 <strong>Error-Handling</strong>: Displays errors to the user if something in the API requests fails.</li>
  <br /><li>📺 <strong>Responsive Website-Design</strong>: Our website is designed to be responsive on all devices.</li>
  <li>⚡ <strong>Optimized Tailwind-CSS</strong>: We used Tailwind-CSS to reduce the amount of loaded CSS and to keep things responsive.</li>
</ul>

## 🔨 Installation
› Before you can start exploring our small website for learning purposes, there are a few preparations you need to make.

💡 › You will need a <strong>few registered plans from the **[BahnAPI](https://developers.deutschebahn.com/db-api-marketplace/apis/frontpage)**:<br />
- **[Free Timetables](https://developers.deutschebahn.com/db-api-marketplace/apis/product/26497)**
- **[StaDa - Station Data](https://developers.deutschebahn.com/db-api-marketplace/apis/product/145141)**
- **[FaSta - Station Facilities Status](https://developers.deutschebahn.com/db-api-marketplace/apis/product/130978)**

Then, follow these steps to ensure everything runs smoothly:
1. Create an application on the DB API Marketplace & add the plans above to it.
2. Set your <strong>correct API login credentials</strong> in [`src/app/services/api-service/types/environment.ts`](https://github.com/RazzerDE/BahnAPI-AngularApp/blob/main/src/app/services/api-service/types/environment.ts).
3. Run `npm install` to install all dependencies.
4. Run `ng build` to build the project.
5. Visit the page and have FUN!
