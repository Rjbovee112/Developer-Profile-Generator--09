const inquirer = require("inquirer");
const puppeteer = require('puppeteer');
const axios = require("axios");
const html = require("./generateHTML");
const util = require("util");
const fs = require("fs");



const qs = [
    {
        type: "input",
        name: "username",
        message: "What is your GitHub username?"
    },
    {
        type: "input",
        name: "color",
        message: "What is your favorite color?"
    }

];

function askUser() {
    return inquirer.prompt(qs);
};
askUser()
    .then(function (data) {
        const username = data.username;
        const color = data.color;

        const userUrl = `https://api.github.com/users/${username}`;
        const reposUrl = `https://api.github.com/users/${username}/starred`;

        axios.get(userUrl)
            .then(function (res) {
                const user = res.data;
                const userImage = user.avatar_url;
                const fullName = user.name;
                const userName = user.login;


                const userLoc = user.location;
                const locUrl = `https://www.google.com/maps/place/${userLoc}`;
                const gitPage = user.html_url;
                const userBlog = user.blog;
                const userBio = user.bio;
                const repoNum = user.public_repos;
                const followers = user.followers;
                const following = user.following;

                axios.get(reposUrl)
                    .then(function (starred) {
                        const starredNum = starred.data.length;
                        const responseObj = [userImage, fullName, userName, locUrl, userLoc, gitPage, userBlog, userBio, repoNum, followers, following, starredNum, color]
                        const genHTML = html(responseObj);
                        (async () => {
                            const browser = await puppeteer.launch();
                            const page = await browser.newPage();
                            await page.setContent(genHTML, { waitUntil: 'networkidle2' });
                            await page.pdf({
                                path: 'resume.pdf',
                                format: 'A4',
                                printBackground: true
                            });

                            await browser.close();
                            console.log("Complete")
                        })();

                    })
            })
    })