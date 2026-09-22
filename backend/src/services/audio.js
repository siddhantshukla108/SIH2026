/**
 * audio.js — Audio processing and conversion helpers
 */
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');

const execPromise = util.promisify(exec);

/**
 * Convert an audio file using ffmpeg
 * @param {string} inputPath - Path to the original audio file
 * @param {string} outputFormat - Desired format (e.g. 'wav', 'mp3')
 * @returns {Promise<string>} - Path to the converted audio file
 */
async function convertAudio(inputPath, outputFormat = 'wav') {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const parsed = path.parse(inputPath);
  const outputPath = path.join(parsed.dir, `${parsed.name}_converted.${outputFormat}`);

  try {
    // For WhatsApp .ogg, converting to 16kHz mono wav is usually best for STT if not natively supported
    // If outputFormat is mp3, it will convert to mp3.
    const command = `ffmpeg -y -i "${inputPath}" -ar 16000 -ac 1 "${outputPath}"`;
    await execPromise(command);
    return outputPath;
  } catch (error) {
    console.error('[AUDIO] FFmpeg conversion failed:', error.message);
    throw new Error('Audio conversion failed. Make sure ffmpeg is installed.');
  }
}

/**
 * Get audio duration in seconds
 */
async function getDuration(filePath) {
  try {
    const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
    const { stdout } = await execPromise(command);
    return parseFloat(stdout.trim());
  } catch (error) {
    console.error('[AUDIO] Failed to get duration:', error.message);
    return null;
  }
}

module.exports = {
  convertAudio,
  getDuration
};
