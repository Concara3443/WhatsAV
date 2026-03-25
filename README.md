# WhatsAV

WhatsAV is a WhatsApp bot designed for aviation enthusiasts. You can chat with the bot using the number **+44 73 0856 4711** or by clicking the link below:

**[Start chatting with WhatsAV](https://wa.me/447308564711?text=Hi!%20How%20does%20WhatsAV%20work%3F)**

**Author:** Guillermo Cortés | [guillermocort.es](https://guillermocort.es)

## Features

- **Real-time Weather**: METAR, TAF, decoded weather summaries
- **Flight Calculators**: Descent, crosswind, fuel, TAS, ETE
- **Airport Information**: NOTAMs, runways, search
- **Utilities**: Unit converter, phonetic alphabet, squawk codes
- **Easy to Use**: No prefix needed in private chats!

## How to Use

### Private Chat
Simply write the command directly:
```
metar LEMD
wx KJFK
descent 35000 3000 120 450
```

### Groups
Mention the bot followed by your command:
```
@WhatsAV metar LEMD
@WhatsAV help
```

## Available Commands

### Weather
| Command | Usage | Description |
|---------|-------|-------------|
| `metar` | `metar <ICAO> [ICAO...]` | Raw METAR observation |
| `wx` | `wx <ICAO>` | Decoded weather summary |
| `taf` | `taf <ICAO> [ICAO...]` | TAF forecast |

### Flight Calculators
| Command | Usage | Description |
|---------|-------|-------------|
| `descent` | `descent <alt> <target> <dist> [speed]` | Top of Descent calculator |
| `crosswind` | `crosswind <wind_dir> <wind_spd> <runway>` | Crosswind component |
| `fuel` | `fuel <fuel> <consumption> [speed]` | Fuel endurance & range |
| `tas` | `tas <IAS> <altitude> [temp]` | True Airspeed calculator |
| `ete` | `ete <distance> <speed> [ETD]` | Time enroute calculator |

### Airport Information
| Command | Usage | Description |
|---------|-------|-------------|
| `notam` | `notam <ICAO>` | Active NOTAMs |
| `ainfo` | `ainfo <ICAO/IATA>` | Airport information |
| `runway` | `runway <ICAO>` | Runway info with wind |
| `search` | `search <name>` | Search airports by name |

### Flights
| Command | Usage | Description |
|---------|-------|-------------|
| `fsearch` | `fsearch <DEP> [ARR]` | Search flights between airports |

### AIP (Spain)
| Command | Description |
|---------|-------------|
| `amendments` | AIP Spain amendments |
| `airac` | Current AIRAC cycle info |

### Utilities
| Command | Usage | Description |
|---------|-------|-------------|
| `convert` | `convert <value> <unit>` | Unit conversions (ft/m, nm/km, etc.) |
| `zulu` | `zulu` | Current UTC time worldwide |
| `phonetic` | `phonetic <text>` | ICAO phonetic alphabet |
| `squawk` | `squawk [code]` | Transponder code meanings |

### Information
| Command | Description |
|---------|-------------|
| `help` | All commands |
| `ping` | Bot latency |
| `about` | About the bot |
| `status` | Bot uptime |

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/Concara3443/WhatsAV.git
    cd WhatsAV
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file with your API keys:
    ```
    RAPIDAPI_KEY=your_rapidapi_key_here
    ```

### Running the Bot

1. Prepare the session (scan QR code):
    ```sh
    npm run prepare
    ```

2. Start the bot:
    ```sh
    npm start
    ```

### Running as a Windows Service (WinSW)

1. Download WinSW and place it in the project directory
2. Create/edit `WhatsAV-service.xml`:
    ```xml
    <service>
      <id>WhatsAV</id>
      <name>WhatsAV Bot</name>
      <description>WhatsApp Aviation Bot</description>
      <executable>node</executable>
      <arguments>src/index.js</arguments>
      <workingdirectory>C:\path\to\WhatsAV</workingdirectory>
      <logpath>C:\path\to\WhatsAV\logs</logpath>
      <log mode="roll-by-size">
        <sizeThreshold>10240</sizeThreshold>
        <keepFiles>8</keepFiles>
      </log>
    </service>
    ```
3. Install and start the service:
    ```sh
    WhatsAV-service.exe install
    WhatsAV-service.exe start
    ```

## Contributing

Feel free to fork the repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## Author

**Guillermo Cortés**
- Website: [guillermocort.es](https://guillermocort.es)
- GitHub: [Concara3443](https://github.com/Concara3443)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
