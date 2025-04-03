import fetch from "node-fetch";
import yts from 'yt-search';
import axios from "axios";

const formatAudio = ['mp3', 'm4a', 'webm', 'acc', 'flac', 'opus', 'ogg', 'wav'];
const formatVideo = ['360', '480', '720', '1080', '1440', '4k'];

const ddownr = {
  download: async (url, format) => {
    if (!formatAudio.includes(format) && !formatVideo.includes(format)) {
      throw new Error('Formato no soportado, verifica la lista de formatos disponibles.');
    }

    const config = {
      method: 'GET',
      url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    try {
      const response = await axios.request(config);

      if (response.data && response.data.success) {
        const { id, title, info } = response.data;
        const { image } = info;
        const downloadUrl = await ddownr.cekProgress(id);

        return {
          id: id,
          image: image,
          title: title,
          downloadUrl: downloadUrl
        };
      } else {
        throw new Error('Fallo al obtener los detalles del video.');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },
  cekProgress: async (id) => {
    const config = {
      method: 'GET',
      url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    try {
      while (true) {
        const response = await axios.request(config);

        if (response.data && response.data.success && response.data.progress === 1000) {
          return response.data.download_url;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
};

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `「「 🫧 」𝑷𝒐𝒓 𝑭𝒂𝒗𝒐𝒓 𝑰𝒏𝒈𝒓𝒆𝒔𝒂 𝑼𝒏 𝑬𝑵𝑳𝑨𝑪𝑬 𝒐 𝑻𝑰𝑻𝑼𝑳𝑶 𝒅𝒆𝒍 𝑨𝒖𝒅𝒊𝒐 𝑸𝒖𝒆 𝑫𝒆𝒔𝒆𝒂 𝑫𝒆𝒔𝒄𝒂𝒓𝒈𝒂𝒓 𝑫𝒆 𝒀𝑶𝑼𝑻𝑼𝑩𝑬\n\n*• EJEMPLO:*\n> ${usedPrefix + command}  Nostalgia - Intro`, m);
    }

    const search = await yts(text);
    if (!search.all || search.all.length === 0) {
      return m.reply('No se encontraron resultados para tu búsqueda.');
    }

    const videoInfo = search.all[0];
    const { title, thumbnail, timestamp, views, ago, url } = videoInfo;
    const vistas = formatViews(views);
    const infoMessage = `🪴𝙏𝙞𝙩𝙪𝙡𝙤: *${title}*\n*━━━•❃°•°❀°•°❃•━━━*\n> 🪴𝘿𝙪𝙧𝙖𝙘𝙞ó𝙣: *${timestamp}*\n*━━━•❃°•°❀°•°❃•━━━*\n> 🪴𝙑𝙞𝙨𝙩𝙖𝙨: *${vistas}*\n*━━━•❃°•°❀°•°❃•━━━*\n> 🪴𝘾𝙖𝙣𝙖𝙡: *${videoInfo.author.name || 'Desconocido'}*\n*━━━•❃°•°❀°•°❃•━━━*\n> 🪴𝙋𝙪𝙗𝙡𝙞𝙘𝙖𝙙𝙤: *${ago}*\n*━━━•❃°•°❀°•°❃•━━━*\n> 🪴𝙀𝙣𝙡𝙖𝙘𝙚: ${url}`;
    const thumb = (await conn.getFile(thumbnail))?.data;

    const JT = {
      contextInfo: {
        externalAdReply: {
          title: packname,
          mediaType: 1,
          previewType: 0,
          mediaUrl: url,
          sourceUrl: url,
          thumbnail: thumb,
          renderLargerThumbnail: true,
        },
      },
    };

    await conn.reply(m.chat, infoMessage, m, JT);

    if (command === 'play' || command === 'yta' || command === 'ytmp3') {
        const api = await ddownr.download(url, 'mp3');
        const result = api.downloadUrl;
        await conn.sendMessage(m.chat, { audio: { url: result }, mimetype: "audio/mpeg" }, { quoted: m });

    } else if (command === 'play2' || command === 'ytv' || command === 'ytmp4') {
      let sources = [
        `https://api.siputzx.my.id/api/d/ytmp4?url=${url}`,
        `https://api.zenkey.my.id/api/download/ytmp4?apikey=zenkey&url=${url}`,
        `https://axeel.my.id/api/download/video?url=${encodeURIComponent(url)}`,
        `https://delirius-apiofc.vercel.app/download/ytmp4?url=${url}`
      ];

      let success = false;
      for (let source of sources) {
        try {
          const res = await fetch(source);
          const { data, result, downloads } = await res.json();
          let downloadUrl = data?.dl || result?.download?.url || downloads?.url || data?.download?.url;

          if (downloadUrl) {
            success = true;
            await conn.sendMessage(m.chat, {
              video: { url: downloadUrl },
              fileName: `${title}.mp4`,
              mimetype: 'video/mp4',
              caption: `🪴 𝘼𝙦𝙪𝙞 𝙩𝙞𝙚𝙣𝙚𝙨 ❃°•°❀°•°❃`,
              thumbnail: thumb
            }, { quoted: m });
            break;
          }
        } catch (e) {
          console.error(`Error con la fuente ${source}:`, e.message);
        }
      }

      if (!success) {
        return m.reply(`🍭 *No se pudo descargar el video:* No se encontró un enlace de descarga válido.`);
      }
    } else {
      throw "Comando no reconocido.";
    }
  } catch (error) {
    return m.reply(`⚠️︎ *Error:* ${error.message}`);
  }
};

handler.command = handler.help = ['play', 'play2', 'ytmp3', 'yta', 'ytmp4', 'ytv'];
handler.tags = ['downloader'];

export default handler;

function formatViews(views) {
  if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'k (' + views.toLocaleString() + ')';
  } else {
    return views.toString();
  }
}
