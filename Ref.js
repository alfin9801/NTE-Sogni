import { launch } from 'puppeteer';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import cfonts from "cfonts";
import fs from 'fs/promises';
import readline from 'readline';

// Detect OS and set Brave executable path
const getBravePath = () => {
    switch (process.platform) {
        case 'win32': return 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
        case 'darwin': return '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
        case 'linux': return '/usr/bin/brave-browser';
        default: throw new Error('Unsupported OS');
    }
};

// Function to read user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

// Function to get random user details
async function getRandomUser() {
    try {
        const response = await fetch('https://randomuser.me/api/');
        const data = await response.json();
        const user = data.results[0];
        return {
            firstName: user.name.first,
            lastName: user.name.last
        };
    } catch (error) {
        console.error('Error fetching random user:', error);
        return null;
    }
}

// Function to handle Puppeteer automation using Brave
async function runAutomation(proxy = null, kodeReff) {
    const user = await getRandomUser();
    if (!user) return;

    const randomNumber = Math.floor(Math.random() * 100) + 1;
    const emailAddress = `${user.firstName}${user.lastName}${randomNumber}@example.com`;
    const password = `Pass${randomNumber}`;

    console.log(`Creating account: ${emailAddress} | ${password}`);

    // Set Puppeteer launch arguments
    let args = [];
    if (proxy) args.push(`--proxy-server=${proxy}`);

    const browser = await launch({
        headless: false,
        executablePath: getBravePath(), // Use Brave Browser
        args,
    });

    const page = await browser.newPage();

    try {
        await page.goto('https://app.sogni.ai/');
        await page.waitForSelector('input[name="username"]', { timeout: 60000 });
        await page.type('input[name="username"]', user.firstName);
        await page.type('input[name="email"]', emailAddress);
        await page.type('input[name="password"]', password);
        await page.type('input[name="referralCode"]', kodeReff);
        
        await page.click('button[type="submit"]');
        console.log(`Successfully registered: ${emailAddress}`);

        await browser.close();
    } catch (error) {
        console.error('Error during automation:', error);
        await browser.close();
    }
}

// Main execution flow
(async () => {
    const kodeReff = await askQuestion('Referral Code: ');
    await runAutomation(null, kodeReff);
    rl.close();
})();
