// const token = 1570803425:AAFTc98VjXsLdj7upd8ZuaDQuZ2vy7m2M18
const express = require("express");
const app = express()

const { Telegraf } = require('telegraf')
const url = "https://www.winamax.es/apuestas-deportivas/match/";
let matchList = ["https://www.winamax.es/apuestas-deportivas/match/10000000", "https://www.winamax.es/apuestas-deportivas/match/20000000", "https://www.winamax.es/apuestas-deportivas/match/30000000", "https://www.winamax.es/apuestas-deportivas/match/40000000"];
let frecuencia = 5 * 60;
const secret = 34729

const bot = new Telegraf(process.env.TOKEN);


const port = process.env.PORT;


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})





bot.use(async (ctx, next) => {
    if (ctx.message.from.id === 1061723 || ctx.message.from.id === 168141379) {
        console.log(ctx.message.from.id);
        await next();
    } else {
        ctx.reply("No estas autorizado")
    }

})


bot.start((ctx) => {

    ctx.reply("Lista de comandos:\n\n/help\n/nuevaID para introducir ID de partido\n/partidos para ver partidos en seguimiento\n/borrar para borrar la  lista de partidos");
})

bot.hears(/nuevaID (.+)/, (ctx) => {
    let id = ctx.match[1];
    if (id.length === 8) {
        ctx.reply(`${url}${id}`)
        matchList.push(`${url}${id}`)
        ctx.reply(`Estas trackeando: ${matchList.length} partidos`);
    } else {
        ctx.reply(`El ID ${id} no es válido, formato incorrecto`)
    }

})

bot.hears(/borrarPartido (.+)/, (ctx) => {
    let index = ctx.match[1] - 1;
    if (matchList.length <= 0) {
        ctx.reply("No hay ningun partido guardado")
    }

    console.log(index);
    if (index < 0 || index > matchList.length - 1) {
        ctx.reply("Nº Inválido, prueba otra vez")

    } else {
        ctx.reply(`Partido Nº ${index + 1} eliminado`)
        matchList.splice(index, 1);
    }

})



bot.help((ctx) => {
    ctx.reply("/help");
})

bot.settings((ctx) => {
    ctx.reply("TODO");
})


bot.command("partidos", ctx => {
    if (matchList.length !== 0) {
        let counter = 1;
        for (let partido of matchList) {
            ctx.reply(`Partido Nº ${counter} \n\n${partido}`)
            counter++;
        }
    } else {
        ctx.reply("No hay ningun partido guardado")
    }
})


bot.command("/borrarTodo", ctx => {
    matchList = [];
    ctx.reply("Partidos borrados")
    console.log(matchList.length)
})


bot.hears("hi", (ctx) => {
    console.log("ctx: ", ctx.update.message.chat.id)

})

bot.launch();

const puppeteer = require("puppeteer");

const scrapper = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    for (let link of matchList) {
        await page.goto(link);
        await page.waitForTimeout(1000);

        const totalJuegos = await page.evaluate(() => {
            const element = document.querySelector("#app-inner > span > div > div.sc-ekBFwZ.kInbsT.middle-column > div > div:nth-child(4) > div:nth-child(6) > div.sc-dTlgpl.cqDlYK")
            if (element !== null) {

                if (element.innerText === "TOTAL JUEGOS") {
                    return true;
                }

                return false;
            }
        })

        console.log(totalJuegos);
        if (totalJuegos) {
            bot.telegram.sendMessage(168141379, `🚨🚨 Total juegos para el partido ${link} disponible \n Eliminando partido de la lista...`).catch(console.error);
            bot.telegram.sendMessage(1061723, `🚨🚨 Total juegos para el partido ${link} disponible \n Eliminando partido de la lista...`).catch(console.error);
            matchList.pop(link);
        }
    }
    await browser.close();
    console.log(matchList);
}

setInterval(function () {
    scrapper();
}, frecuencia * 1000);

