const puppeteer = require('puppeteer');
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

(async () => {
  const browser = await puppeteer.launch({ headless: 'new'}) // headless: true
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('https://interactly.video/'); // Replace with your desired URL

  const screenshots = [];
  const scrollSteps = 300; // Adjust number of scroll steps
  const frameInterval = 200; // Increased interval for slower scrolling (ms)

  let currentPosition = 0;
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);

  // Slowly scroll and capture screenshots
  for (let i = 0; i < scrollSteps; i++) {
    const screenshot = await page.screenshot({ type: 'png' });
    screenshots.push(screenshot);

    const scrollDistance = pageHeight / scrollSteps;
    currentPosition += scrollDistance;

    await page.evaluate(_scrollTo => {
      window.scrollTo(0, _scrollTo);
    }, currentPosition);

    await page.waitForTimeout(frameInterval);
  }

  await browser.close();

  // Save screenshots as images in a temporary directory
  const tempDir = 'temp_frames';
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  screenshots.forEach((screenshot, index) => {
    fs.writeFileSync(`${tempDir}/frame-${index}.png`, screenshot);
  });

  // Create video from frames using ffmpeg
  const videoPath = 'output.mp4';
  ffmpeg()
    .input(`${tempDir}/frame-%d.png`)
    .inputFPS(24) // Adjust FPS as needed
    .output(videoPath)
    .on('end', () => {
      console.log(`Video saved as ${videoPath}`);
      // Cleanup: Remove temporary frames
      fs.readdirSync(tempDir).forEach((file) => {
        fs.unlinkSync(`${tempDir}/${file}`);
      });
      fs.rmdirSync(tempDir);
    })
    .on('error', (err) => {
      console.error('Error during video generation:', err);
    })
    .run();
})();