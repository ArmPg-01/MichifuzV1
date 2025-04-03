let handler = async(m, { isOwner, isAdmin, conn, text, participants, args, command }) => {
    if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn)
    throw false
    }
    let pesan = args.join` `
    let oi = `*MENSAJE:* ${pesan}`
    let teks = `*DON MICHIFUZ LOS INVOCA*\n${oi}\n\n*MENCIONES*\n`
    for (let mem of participants) {
    teks += `👻 @${mem.id.split('@')[0]}\n`}
    teks += `${wm}`
    conn.sendMessage(m.chat, { text: teks, mentions: participants.map(a => a.id) } )
    }
    handler.command = /^(tagall|invocar|invocacion|todos|invocación)$/i
    handler.admin = true
    handler.group = true
    handler.botAdmin = true
    export default handler
