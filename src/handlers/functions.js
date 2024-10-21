const settings = require("../../config/settings.json");
const { client } = require("../index.js");

module.exports = {
	nFormatter,
	shuffle,
	formatDate,
	delay,
	getRandomInt,
	duration,
	getRandomNum,
	createBar,
	format,
	escapeRegex,
	arrayMove,
	isValidURL,
	parseMilliseconds,
	onCoolDown,
};

/**
 * Checks if a command is on cooldown for a specific user.
 * @param {*} message A Message, with the client, information
 * @param {*} command The Command with the command.name
 * @returns BOOLEAN
 */
function onCoolDown(message, command) {
	console.log(client);
	if (!message) throw "No Message granted as First Parameter";
	if (!command || !command.name) throw "No Command with a valid Name granted as Second Parameter";
	if (!client.cooldowns.has(command.name)) {
		client.cooldowns.set(command.name, new Map());
	}
	const now = Date.now();
	const timestamps = client.cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || settings.default_cooldown_in_sec) * 1000;
	if (timestamps.has(message.from)) {
		const expirationTime = timestamps.get(message.from) + cooldownAmount;
		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return timeLeft;
		} else {
			timestamps.set(message.from, now);
			setTimeout(() => timestamps.delete(message.from), cooldownAmount);
			return false;
		}
	} else {
		timestamps.set(message.from, now);
		setTimeout(() => timestamps.delete(message.from), cooldownAmount);
		return false;
	}
}

/**
 * Parses milliseconds into an object with days, hours, minutes, seconds, milliseconds, microseconds, and nanoseconds.
 * @param {*} milliseconds NUMBER | TIME IN MILLISECONDS
 * @returns Object of Formatted Time in Days to nanoseconds
 */
function parseMilliseconds(milliseconds) {
	if (typeof milliseconds !== "number") {
		throw new TypeError("Expected a number");
	}

	return {
		days: Math.trunc(milliseconds / 86400000),
		hours: Math.trunc(milliseconds / 3600000) % 24,
		minutes: Math.trunc(milliseconds / 60000) % 60,
		seconds: Math.trunc(milliseconds / 1000) % 60,
		milliseconds: Math.trunc(milliseconds) % 1000,
		microseconds: Math.trunc(milliseconds * 1000) % 1000,
		nanoseconds: Math.trunc(milliseconds * 1e6) % 1000,
	};
}

/**
 * Checks if a string contains a valid URL.
 * @param {*} string A WHOLE TEXT, checks if there is a URL IN IT
 * @returns BOOLEAN/THE URL
 */
function isValidURL(string) {
	const args = string.split(" ");
	let url;
	for (const arg of args) {
		try {
			url = new URL(arg);
			url = url.protocol === "http:" || url.protocol === "https:";
			break;
		} catch (_) {
			url = false;
		}
	}
	return url;
}

/**
 * Shuffles a given array.
 * @param {*} array Shuffles a given array (mix)
 * @returns ARRAY
 */
function shuffle(array) {
	try {
		let j, x, i;
		for (i = array.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			x = array[i];
			array[i] = array[j];
			array[j] = x;
		}
		return array;
	} catch (e) {
		console.log(String(e.stack));
	}
}

/**
 * Formats a date.
 * @param {*} date Date format (Date.now())
 * @returns Formatted Date
 */
function formatDate(date) {
	try {
		return new Intl.DateTimeFormat("en-US").format(date);
	} catch (e) {
		console.log(String(e.stack));
		return false;
	}
}

/**
 * Parses a duration into an object with days, hours, minutes, seconds, and milliseconds.
 * @param {*} duration Number | Time in Milliseconds
 * @returns Object of Formatted Time in Days to milliseconds
 */
function parseDuration(duration) {
	let remain = duration;
	let days = Math.floor(remain / (1000 * 60 * 60 * 24));
	remain = remain % (1000 * 60 * 60 * 24);

	let hours = Math.floor(remain / (1000 * 60 * 60));
	remain = remain % (1000 * 60 * 60);

	let minutes = Math.floor(remain / (1000 * 60));
	remain = remain % (1000 * 60);

	let seconds = Math.floor(remain / 1000);
	remain = remain % 1000;

	let milliseconds = remain;

	return {
		days,
		hours,
		minutes,
		seconds,
		milliseconds,
	};
}

/**
 * Formats a time object into a string.
 * @param {*} o Object of Time from days to nanoseconds/milliseconds
 * @param {*} useMilli Optional Boolean parameter, if it should use milliseconds or not in the showof
 * @returns Formatted Time
 */
function formatTime(o, useMilli = false) {
	let parts = [];
	if (o.days) {
		let ret = o.days + " Day";
		if (o.days !== 1) {
			ret += "s";
		}
		parts.push(ret);
	}
	if (o.hours) {
		let ret = o.hours + " Hr";
		if (o.hours !== 1) {
			ret += "s";
		}
		parts.push(ret);
	}
	if (o.minutes) {
		let ret = o.minutes + " Min";
		if (o.minutes !== 1) {
			ret += "s";
		}
		parts.push(ret);
	}
	if (o.seconds) {
		let ret = o.seconds + " Sec";
		if (o.seconds !== 1) {
			ret += "s";
		}
		parts.push(ret);
	}
	if (useMilli && o.milliseconds) {
		let ret = o.milliseconds + " ms";
		parts.push(ret);
	}
	if (parts.length === 0) {
		return "instantly";
	} else {
		return parts;
	}
}

/**
 * Formats a duration into a string.
 * @param {*} duration Number | Time in Millisceonds
 * @param {*} useMilli Optional Boolean parameter, if it should use milliseconds or not in the showof
 * @returns Formatted Time
 */
function duration(duration, useMilli = false) {
	let time = parseDuration(duration);
	return formatTime(time, useMilli);
}

/**
 * Delays execution for a given number of milliseconds.
 * @param {*} delayInms Number | Time in Milliseconds
 * @returns Promise, waiting for the given Milliseconds
 */
function delay(delayInms) {
	try {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(2);
			}, delayInms);
		});
	} catch (e) {
		console.log(String(e.stack));
	}
}

/**
 * Returns a random integer between 0 and max.
 * @param {*} max Number | 0 - MAX
 * @returns Number
 */
function getRandomInt(max) {
	try {
		return Math.floor(Math.random() * Math.floor(max));
	} catch (e) {
		console.log(String(e.stack));
	}
}

/**
 * Returns a random number between min and max.
 * @param {*} min Number | min - max
 * @param {*} max Number | min - max
 * @returns Number
 */
function getRandomNum(min, max) {
	try {
		return Math.floor(Math.random() * Math.floor(max - min + min));
	} catch (e) {
		console.log(String(e.stack));
	}
}

/**
 * Creates a progress bar.
 * @param {*} total Number | Time in Milliseconds
 * @param {*} current  Number | Time in Milliseconds | Current Music Position
 * @param {*} size Number | Amount of Letters in the Bar (SIZE) Default is: 25
 * @param {*} line EMOJI | the default line is: "▬"
 * @param {*} slider EMOJI | the default slider is: "🔷"
 * @returns STRING a BAR [▬▬▬▬▬🔷▬▬▬▬▬▬▬▬]
 */
function createBar(total, current, size = 25, line = "▬", slider = "🔷") {
	try {
		if (!total) throw "MISSING MAX TIME";
		if (!current) return `**[${mover}${line.repeat(size - 1)}]**`;
		let bar =
			current > total
				? [line.repeat((size / 2) * 2), (current / total) * 100]
				: [
						line
							.repeat(Math.round((size / 2) * (current / total)))
							.replace(/.$/, slider) +
							line.repeat(size - Math.round(size * (current / total)) + 1),
						current / total,
					];
		if (!String(bar).includes(mover)) {
			return `**[${mover}${line.repeat(size - 1)}]**`;
		} else {
			return `**[${bar[0]}]**`;
		}
	} catch (e) {
		console.log(String(e.stack));
	}
}

/**
 * Formats milliseconds into a string in the format HH:MM:SS.
 * @param {*} millis Number | Time in Milliseconds
 * @returns Formatted time in: HH:MM:SS HH only if bigger then 0
 */
function format(millis) {
	try {
		var h = Math.floor(millis / 3600000),
			m = Math.floor(millis / 60000),
			s = ((millis % 60000) / 1000).toFixed(0);
		if (h < 1)
			return (
				(m < 10 ? "0" : "") +
				m +
				":" +
				(s < 10 ? "0" : "") +
				s +
				" | " +
				Math.floor(millis / 1000) +
				" Seconds"
			);
		else
			return (
				(h < 10 ? "0" : "") +
				h +
				":" +
				(m < 10 ? "0" : "") +
				m +
				":" +
				(s < 10 ? "0" : "") +
				s +
				" | " +
				Math.floor(millis / 1000) +
				" Seconds"
			);
	} catch (e) {
		console.log(String(e.stack));
	}
}

/**
 * Escapes special characters in a string for use in a regular expression.
 * @param {*} str String of message, not replacing pings
 * @returns Only the Pinged message
 */
function escapeRegex(str) {
	try {
		return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
	} catch (e) {
		console.log(String(e.stack));
	}
}

/**
 * Moves an item in an array from one position to another.
 * @param {*} array ARRAY | Complete Array to work with
 * @param {*} from NUMBER | Position of first ITEM
 * @param {*} to NUMBER | Position where to move it to
 * @returns ARRAY | the Moved Array
 */
function arrayMove(array, from, to) {
	try {
		array = [...array];
		const startIndex = from < 0 ? array.length + from : from;
		if (startIndex >= 0 && startIndex < array.length) {
			const endIndex = to < 0 ? array.length + to : to;
			const [item] = array.splice(from, 1);
			array.splice(endIndex, 0, item);
		}
		return array;
	} catch (e) {
		console.log(String(e.stack));
	}
}

/**
 * Formats a number with a specified number of digits and a suffix.
 * @param {*} num Number
 * @param {*} digits How many digits it should have: 10.231k == 3
 * @returns Formatted Number
 */
function nFormatter(num, digits = 2) {
	const lookup = [
		{ value: 1, symbol: "" },
		{ value: 1e3, symbol: "k" },
		{ value: 1e6, symbol: "M" },
		{ value: 1e9, symbol: "G" },
		{ value: 1e12, symbol: "T" },
		{ value: 1e15, symbol: "P" },
		{ value: 1e18, symbol: "E" },
	];
	const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
	var item = lookup
		.slice()
		.reverse()
		.find(function (item) {
			return num >= item.value;
		});
	return item
		? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
		: "0";
}
