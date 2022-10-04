import { config } from "dotenv";
import { Client, GatewayIntentBits, Routes } from "discord.js";
import { REST } from "@discordjs/rest";

config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const rest = new REST({ version: "10" }).setToken(TOKEN);

client.on("ready", () => { console.log(`${client.user.tag} is now online.`) });

client.on('interactionCreate', (interaction) => {
    if (interaction.isChatInputCommand()) {

        const properFormat = Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });

        const startingBal = properFormat.format(interaction.options.get('balance').value);
        const baseRate = interaction.options.get('rate').value;

        let finalBal = Number(interaction.options.get('balance').value);
        let rate = (Number(baseRate) / 100) + 1;
        let time = 252;

        if (interaction.options.get('time') != undefined) {
            time = parseInt(interaction.options.get('time').value)
        }

        for (let i = 0; i < time; i++) {
            finalBal *= rate;
        }

        finalBal = properFormat.format(finalBal);

        let output;

        if (time == 21) {
            output = `Starting balance: ${startingBal}\nRate: ${baseRate}%\nTime period: 1 Month (avg 126 trading days)\nFinal amount: ${finalBal}`;
        } else if (time == 126) {
            output = `Starting balance: ${startingBal}\nRate: ${baseRate}%\nTime period: 6 Months (avg 126 trading days\nFinal amount: ${finalBal}`;
        } else if (time == 252) {
            output = `Starting balance: ${startingBal}\nRate: ${baseRate}%\nTime period: 1 Year (avg 252 trading days)\nFinal amount: ${finalBal}`;
        } else if (time == 504) {
            output = `Starting balance: ${startingBal}\nRate: ${baseRate}%\nTime period: 2 Years (avg 504 trading days)\nFinal amount: ${finalBal}`;
        } else if (time == 1260) {
            output = `Starting balance: ${startingBal}\nRate: ${baseRate}%\nTime period: 5 Years (avg 1,260 trading days)\nFinal amount: ${finalBal}`;
        } else if (time == 2520) {
            output = `Starting balance: ${startingBal}\nRate: ${baseRate}%\nTime period: 10 Years (avg 2,520 trading days)\nFinal amount: ${finalBal}`;
        }

        interaction.reply({ content: output });
    }
})

async function main() {

    const commands = [
        {
            name: 'compoundprofits',
            description: 'Calculate total profits after given starting balance, % gain per day, and time period.',
            options: [
                {
                    name: 'balance',
                    description: 'Starting balance in the account',
                    type: 3,
                    required: true,
                },
                {
                    name: 'rate',
                    description: 'Daily percent gain',
                    type: 3,
                    required: true,
                },
                {
                    name: 'time',
                    description: 'Time period passed compounding profits',
                    type: 3,
                    choices: [
                        {
                            name: '1M',
                            value: '21',
                        },
                        {
                            name: '6M',
                            value: '126',
                        },
                        {
                            name: '1Y',
                            value: '252',
                        },
                        {
                            name: '2Y',
                            value: '504',
                        },
                        {
                            name: '5Y',
                            value: '1260',
                        },
                        {
                            name: '10Y',
                            value: '2520',
                        },
                    ]
                }
            ],
        },
    ];

    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commands,
        });
        client.login(TOKEN);
    } catch (err) {
        console.log(err);
    }
}

main();