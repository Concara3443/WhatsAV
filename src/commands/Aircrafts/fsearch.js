require('dotenv').config();
const { fetchData } = require("../../utils/api.js");

module.exports = {
    name: "fsearch",
    category: "Aircrafts",
    aliases: [],
    cooldown: 3,
    usage: "search <Departure airport code> [Arrival airport code]",
    description: "Returns all the flights between the provided airports in the next 12 hours. If no arrival airport is provided, all flights departing from the departure airport will be shown.\nOPTIONS: If -cs is provided, codeshared flights will be included.",
    memberpermissions: [],
    requiredroles: [],
    alloweduserids: [],
    run: async (client, message, args, chatId, text, prefix) => {
        try {
    
            let withCodeshared = false;
            if (args.includes('-cs')) {
                withCodeshared = true;
                args = args.filter(arg => arg !== '-cs');
            }
            
            if (args.length < 1 || args.length > 3) {
                return message.reply("AAAAAPlease provide a departure airport code and optionally an arrival airport code.");
            }

            const departureAirport = args[0].toUpperCase();
            let arrivalAirport
            if (args[1]) arrivalAirport = args[1].toUpperCase() || "";
            const iType = departureAirport.length === 3 ? "iata" : "icao";
            const endpoint = `https://aerodatabox.p.rapidapi.com/flights/airports/${iType}/${departureAirport}`;

            const params = {
                withLeg: 'True',
                direction: 'Departure',
                durationMinutes: '720',
                withCodeshared: withCodeshared ? 'True' : 'False',
                withCargo: 'True',
                withPrivate: 'True',
                withLocation: 'False',
                withCancelled: 'True'
            };

            fetchData(endpoint, params).then(function (response) {
                if (response.departures && response.departures.length > 0) {
                    let filteredFlights = response.departures.filter(flight => 
                        !arrivalAirport || flight.arrival.airport.iata === arrivalAirport || flight.arrival.airport.icao === arrivalAirport
                    );
                    let replyMessage = `Operations found: ${filteredFlights.length}\n\n`;
                    let flightsFound = false;
                    response.departures.forEach(flight => {
                        if (!arrivalAirport || flight.arrival.airport.iata === arrivalAirport || flight.arrival.airport.icao === arrivalAirport) {
                            flightsFound = true;
                            replyMessage += `Flight Number: ${flight.number}\n`;
                            replyMessage += `Airline: ${flight.airline.name}\n`;
                            replyMessage += `Aircraft: ${flight.aircraft.model}\n`;
                            const departureTime = new Date(flight.departure.scheduledTime.local);
                            const utcTime = new Date(flight.departure.scheduledTime.utc);
                            const formattedLocalTime = `${departureTime.getDate().toString().padStart(2, '0')}/${(departureTime.getMonth() + 1).toString().padStart(2, '0')}/${departureTime.getFullYear()} ${departureTime.getHours().toString().padStart(2, '0')}:${departureTime.getMinutes().toString().padStart(2, '0')} GMT ${departureTime.getTimezoneOffset() / -60} (${utcTime.getUTCHours().toString().padStart(2, '0')}:${utcTime.getUTCMinutes().toString().padStart(2, '0')}z)`;
                            replyMessage += `Departure: ${formattedLocalTime}\n`;
                            replyMessage += `Arrival: ${flight.arrival.airport.name} (${flight.arrival.airport.iata})\n`;
                            replyMessage += `Status: ${flight.status}\n\n`;
                        }
                    });
                    if (!flightsFound) {
                        replyMessage = 'No operations found for the specified criteria.\n';
                    }
                    message.reply(replyMessage);
                } else {
                    message.reply("No departures found in the response.");
                }
            }).catch(error => {
                console.error("Error fetching data:", error);
                message.reply("An error occurred while fetching flight data.");
            });
        } catch (e) {
            console.log(String(e.stack));
            return message.reply(`❌ ERROR | An error occurred\n\`\`\`${e.message ? String(e.message).slice(0, 2000) : String(e).slice(0, 2000)}\`\`\``);
        }
    }
};