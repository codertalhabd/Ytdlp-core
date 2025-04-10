const express = require("express");
const ytdl = require("@distube/ytdl-core");
const cors = require("cors");
const sanitize = require("sanitize-filename");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
    const ping = new Date();
    ping.setHours(ping.getHours() - 3);
    console.log(
        `Ping at: ${ping.getUTCHours()}:${ping.getUTCMinutes()}:${ping.getUTCSeconds()}`
    );
    res.send("YouTube Downloader API is running");
});

app.get("/info", async (req, res) => {
    const { url } = req.query;

    if (!url) return res.status(400).send("Invalid query");
    if (!ytdl.validateURL(url)) return res.status(400).send("Invalid URL");

    try {
        const info = await ytdl.getInfo(url, {
            requestOptions: {
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            }
        });

        const details = info.videoDetails;

        res.send({
            title: details.title,
            thumbnail: details.thumbnails?.[2]?.url || "",
            duration: details.lengthSeconds,
        });
    } catch (error) {
        console.error("Error fetching info:", error);
        res.status(500).send("Failed to retrieve video info");
    }
});

app.get("/mp3", async (req, res) => {
    const { url } = req.query;

    if (!url) return res.status(400).send("Invalid query");
    if (!ytdl.validateURL(url)) return res.status(400).send("Invalid URL");

    try {
        const info = await ytdl.getInfo(url, {
            requestOptions: {
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            }
        });
        const title = sanitize(info.videoDetails.title);

        res.header("Content-Disposition", `attachment; filename="${title}.mp3"`);
        res.header("Content-Type", "audio/mpeg");

        ytdl(url, {
            filter: "audioonly",
            quality: "highestaudio",
            requestOptions: {
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            }
        }).pipe(res);
    } catch (error) {
        console.error("Error streaming mp3:", error);
        res.status(500).send("Error streaming audio");
    }
});

app.get("/mp4", async (req, res) => {
    const { url } = req.query;

    if (!url) return res.status(400).send("Invalid query");
    if (!ytdl.validateURL(url)) return res.status(400).send("Invalid URL");

    try {
        const info = await ytdl.getInfo(url, {
            requestOptions: {
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            }
        });
        const title = sanitize(info.videoDetails.title);

        res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);
        res.header("Content-Type", "video/mp4");

        ytdl(url, {
            quality: "highestvideo",
            requestOptions: {
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            }
        }).pipe(res);
    } catch (error) {
        console.error("Error streaming mp4:", error);
        res.status(500).send("Error streaming video");
    }
});

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
