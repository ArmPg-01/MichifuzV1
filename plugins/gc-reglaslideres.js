import axios from "axios";

const handler = async (m, { conn, args, command, usedPrefix }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/es.json`));
  const tradutor = _translate.plugins.descargas_instagram;

  if (!args[0])
    throw `
  👽 *Reglas De Versus*
✅ Instrucciones
Cada equipo debe seleccionar un color diferente al del rival.
El mapa se divide en dos lados: A y B. Un equipo cae en el lado A y el otro cae en el B.
La primera sala la crea el clan que solicita el versus. La segunda sala la crea el clan rival. Si hay empate, la tercera sala la crea el clan perdedor de la primera sala.
Si las dos primeras salas son ganadas por el mismo clan, se declara victoria y ya no hay tercera sala. El versus habrá concluido.
Se permiten los vehículos únicamente para llegar a zona. Están prohibidos a partir del cierre de la primera zona.
Se permite realizar eliminaciones solo a partir del cierre de la primera zona.
Se permiten todas las habilidades (incluyendo CR7, Wukong y Skyler).
❌ Prohibiciones
Se prohíbe la VSS y la Rompe Hielos (la AWM sí está permitida).
Se prohíben las minas, granadas de fragmentación, cegadoras, M79, ballesta y cualquier explosivo.
Se prohíbe usar el mismo color del equipo enemigo. Si un jugador infringe esta regla debe eliminarse.
Se prohíbe invadir y/o lootear la zona de caída del enemigo antes de que cierre la primera zona.
Se prohíben las Garitas, pero el uso de segundos pisos sí está permitido.
Se prohíben los espectadores.
⚙️ Configuración De La Sala De Versus
Battle Royale, Modo De Equipo En Escuadras, 200 De Vida, Municiones Limitadas.
`;
  await m.reply(global.wait);
  try {
    const img = await instagramDownload(args[0]);
    for (let i = 0; i < img.data.length; i++) {
      const item = img.data[i];
      if (item.type === "image") {
        await conn.sendMessage(
          m.chat,
          { image: { url: item.url } },
          { quoted: m },
        );
      } else if (item.type === "video") {
        await conn.sendMessage(
          m.chat,
          { video: { url: item.url } },
          { quoted: m },
        );
      }
    }
  } catch (err) {
    const res = await axios.get(
      "https://deliriusapi-official.vercel.app/download/instagram",
      {
        params: {
          url: args[0],
        },
      },
    );
    const result = res.data.data;
    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      if (item.type === "image") {
        await conn.sendMessage(
          m.chat,
          { image: { url: item.url } },
          { quoted: m },
        );
      } else if (item.type === "video") {
        await conn.sendMessage(
          m.chat,
          { video: { url: item.url } },
          { quoted: m },
        );
      }
    }
  }
};

handler.command =
  /^(lideres|reglaslideres)$/i;
export default handler;

const instagramDownload = async (url) => {
  return new Promise(async (resolve) => {
    if (!url.match(/\/(reel|reels|p|stories|tv|s)\/[a-zA-Z0-9_-]+/i)) {
      return resolve({ status: false, creator: "Sareth" });
    }

    try {
      let jobId = await (
        await axios.post(
          "https://app.publer.io/hooks/media",
          {
            url: url,
            iphone: false,
          },
          {
            headers: {
              Accept: "/",
              "Accept-Encoding": "gzip, deflate, br, zstd",
              "Accept-Language": "es-ES,es;q=0.9",
              "Cache-Control": "no-cache",
              Origin: "https://publer.io",
              Pragma: "no-cache",
              Priority: "u=1, i",
              Referer: "https://publer.io/",
              "Sec-CH-UA":
                '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
              "Sec-CH-UA-Mobile": "?0",
              "Sec-CH-UA-Platform": '"Windows"',
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            },
          },
        )
      ).data.job_id;
      let status = "working";
      let jobStatusResponse;
      while (status !== "complete") {
        jobStatusResponse = await axios.get(
          `https://app.publer.io/api/v1/job_status/${jobId}`,
          {
            headers: {
              Accept: "application/json, text/plain, /",
              "Accept-Encoding": "gzip, deflate, br, zstd",
              "Accept-Language": "es-ES,es;q=0.9",
              "Cache-Control": "no-cache",
              Origin: "https://publer.io",
              Pragma: "no-cache",
              Priority: "u=1, i",
              Referer: "https://publer.io/",
              "Sec-CH-UA":
                '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
              "Sec-CH-UA-Mobile": "?0",
              "Sec-CH-UA-Platform": '"Windows"',
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            },
          },
        );
        status = jobStatusResponse.data.status;
      }

      let data = jobStatusResponse.data.payload.map((item) => {
        return {
          type: item.type === "photo" ? "image" : "video",
          url: item.path,
        };
      });

      resolve({
        status: true,
        data,
      });
    } catch (e) {
      resolve({
        status: false,
        msg: new Error(e).message,
      });
    }
  });
};
