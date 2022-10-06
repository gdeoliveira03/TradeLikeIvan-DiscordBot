import { config } from 'dotenv';
import { Client, GatewayIntentBits, Routes } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';

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
        
        // Set the format for USD
        const properFormat = Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });

        // Declare variables that will get outputted
        const startingBal = properFormat.format(interaction.options.get('balance').value);
        const baseRate = interaction.options.get('rate').value;

        const week = 5;
        const month = 21;
        const year = 252;

        // Declare variables for calculations
        let finalBal = Number(interaction.options.get('balance').value);
        let rate = (Number(baseRate) / 100) + 1;
        let interval = interaction.options.get('interval').value;
        let period = parseInt(interaction.options.get('period').value);

        // Calculate the final balance

        if (interval == 'd') {
            for (let i = 0; i < period; i++) {
                finalBal *= rate;
            }
        } else if (interval == 'w') {
            for (let i = 0; i < period / week; i++) {
                finalBal *= rate;
            }
        } else if (interval == 'm') {
            for (let i = 0; i < period / month; i++) {
                finalBal *= rate;
            }
        } else if (interval == 'y') {
            for (let i = 0; i < period / year; i++) {
                finalBal *= rate;
            }
        }

        // Format the final balance 
        finalBal = properFormat.format(finalBal);

        let output;

        // Outputs
        if (period == 21) {
            output = `Starting balance: ${startingBal}\nRate: ${baseRate}%\nTime period: 1 Month (avg 21 trading days)\nFinal amount: ${finalBal}`;
        } else if (period == 126) {
            output = `Starting balance: ${startingBal}\nRate: ${baseRate}%\nTime period: 6 Months (avg 126 trading days)\nFinal amount: ${finalBal}`;
        } else if (period == 252) {
            output = `Starting balance: ${startingBal}\nRate: ${baseRate}%\nTime period: 1 Year (avg 252 trading days)\nFinal amount: ${finalBal}`;
        } else if (period == 504) {
            output = `Starting balance: ${startingBal}\nRate: ${baseRate}%\nTime period: 2 Years (avg 504 trading days)\nFinal amount: ${finalBal}`;
        } else if (period == 1260) {
            output = `Starting balance: ${startingBal}\nRate: ${baseRate}%\nTime period: 5 Years (avg 1,260 trading days)\nFinal amount: ${finalBal}`;
        } else if (period == 2520) {
            output = `Starting balance: ${startingBal}\nRate: ${baseRate}%\nTime period: 10 Years (avg 2,520 trading days)\nFinal amount: ${finalBal}`;
        }

        // Actual code that will reply to the user
        interaction.reply({ content: output });
    }
})

async function main() {

    const compoundProfitsCommand = new SlashCommandBuilder()
        .setName('compoundprofits')
        .setDescription('Calculate total profits with compounded profits')
        .addStringOption((option) => 
            option
                .setName('balance')
                .setDescription('Starting balance in the account')
                .setRequired(true)
        )
        .addStringOption((option) => 
            option
                .setName('rate')
                .setDescription('Percent gain for each time interval given')
                .setRequired(true)
        )
        .addStringOption((option) => 
            option
                .setName('interval')
                .setDescription('Time interval for how often you achieve the rate')
                .setRequired(true)
                .setChoices(
                    {
                        name: 'Daily',
                        value: 'd',
                    },
                    {
                        name: 'Weekly',
                        value: 'w',
                    },
                    {
                        name: 'Monthly',
                        value: 'm',
                    },
                    {
                        name: 'Yearly',
                        value: 'y',
                    }
                )
        )
        .addStringOption((option) => 
            option
                .setName('period')
                .setDescription('Amount of time spent compounding profits')
                .setRequired(true)
                .setChoices(
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
                    }
                )
        );
    
    const commands = [compoundProfitsCommand.toJSON()];

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