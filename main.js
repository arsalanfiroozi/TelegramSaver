import { Telegraf } from 'telegraf'
import https from 'https'
import fs from 'fs'
import { Mutex, Semaphore, withTimeout } from 'async-mutex';

const key = 'YOURKey';

const bot = new Telegraf(key);

let id_voice = 1;
let id_video = 1;
let id_photo = 1;

const mutex1 = new Mutex();
const mutex2 = new Mutex();
const mutex3 = new Mutex();

bot.start((ctx) => ctx.reply('This bot is created for saving images to my server.'))
bot.help((ctx) => ctx.reply('Just send images of your journey...'))
// bot.hears('hi', (ctx) => ctx.reply('Hey there'))

bot.command('quit', (ctx) => {
  // Explicit usage
  ctx.telegram.leaveChat(ctx.message.chat.id)

  // Using context shortcut
  ctx.leaveChat()
})

bot.on('photo', async (ctx) => {
  mutex1.runExclusive(async () => {
    // Explicit usage
    // console.log(ctx.update.message.photo)
    // console.log(Object.keys(ctx.update.message.photo).length);

    https.get('https://api.telegram.org/bot' + key + '/getFile?file_id=' + ctx.update.message.photo[3].file_id, (resp) => {
      let data = '';

      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      resp.on('end', async () => {
        data = JSON.parse(data);
        if (data.ok) {
          console.log(data.result.file_path)
          const file = fs.createWriteStream("photos/file" + id_photo + ".jpg");
          id_photo = id_photo + 1;
          https.get('https://api.telegram.org/file/bot' + key + '/' + data.result.file_path, function (response) {
            response.pipe(file);
            console.log('Saved' + id_photo);
          });
        }
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });

    ctx.telegram.sendMessage(ctx.message.chat.id, `Oh Oh Aks`)
  });
})

bot.on('video', async (ctx) => {
  ctx.telegram.sendMessage(ctx.message.chat.id, `Oh Oh Media`)
  mutex2.runExclusive(async () => {
    // Explicit usage
    console.log(ctx.update.message)
    // console.log(Object.keys(ctx.update.message.photo).length);

    https.get('https://api.telegram.org/bot' + key + '/getFile?file_id=' + ctx.update.message.video.file_id, (resp) => {
      let data = '';

      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      resp.on('end', async () => {
        data = JSON.parse(data);
        if (data.ok) {
          console.log(data.result.file_path)
          const file = fs.createWriteStream("videos/file" + id_video + ".mp4");
          id_video = id_video + 1;
          https.get('https://api.telegram.org/file/bot' + key + '/' + data.result.file_path, function (response) {
            response.pipe(file);
            console.log('Saved' + id_video);
          });
        }
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });

  });
  ctx.telegram.sendMessage(ctx.message.chat.id, `Media Saved`)
})

bot.on('voice', async (ctx) => {
  ctx.telegram.sendMessage(ctx.message.chat.id, `Oh Oh voice`)
  mutex3.runExclusive(async () => {
    // Explicit usage
    console.log(ctx.update.message)
    // console.log(Object.keys(ctx.update.message.photo).length);

    https.get('https://api.telegram.org/bot' + key + '/getFile?file_id=' + ctx.update.message.voice.file_id, (resp) => {
      let data = '';

      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      resp.on('end', async () => {
        data = JSON.parse(data);
        if (data.ok) {
          console.log(data.result.file_path)
          const file = fs.createWriteStream("voices/file" + id_voice + ".ogg");
          id_voice = id_voice + 1;
          https.get('https://api.telegram.org/file/bot' + key + '/' + data.result.file_path, function (response) {
            response.pipe(file);
            console.log('Saved' + id_voice);
          });
        }
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });

  });
  ctx.telegram.sendMessage(ctx.message.chat.id, `Voice Saved`)
})

bot.on('text', (ctx) => {
  // Explicit usage
  console.log(ctx.update.message.from);
  ctx.telegram.sendMessage(ctx.message.chat.id, `Hello ${ctx.update.message.from.first_name} \nThis bot belongs to big big brother, Arsalan Fioozi!`)

  // Using context shortcut
  //ctx.reply(`Hello ${ctx.state.role}`)
})

bot.on('inline_query', (ctx) => {
  const result = []
  // Explicit usage
  ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result)

  // Using context shortcut
  ctx.answerInlineQuery(result)
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

console.log('Started');