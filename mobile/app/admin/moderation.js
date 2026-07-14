#!/usr/bin/env node
// Simple local moderation script
// Usage: node moderation.js "Some text to check"

const banned = [
	'badword',
	'spam',
	'phish',
	'malware'
];

function findBannedWords(text) {
	const found = new Set();
	const lower = text.toLowerCase();
	for (const word of banned) {
		if (lower.includes(word.toLowerCase())) found.add(word);
	}
	return Array.from(found);
}

function moderate(text) {
	const found = findBannedWords(text);
	return {
		text,
		flagged: found.length > 0,
		matches: found
	};
}

function runDemo() {
	const samples = [
		'This is a harmless message.',
		'This message contains spam and malware links.',
		'Watch out for phish attempts and badword usage.'
	];
	for (const s of samples) {
		console.log(JSON.stringify(moderate(s), null, 2));
	}
}

if (require.main === module) {
	const args = process.argv.slice(2);
	if (args.length === 0) {
		console.log('No input provided — running demo samples:\n');
		runDemo();
		process.exit(0);
	}
	const input = args.join(' ');
	console.log(JSON.stringify(moderate(input), null, 2));
}

module.exports = { moderate, findBannedWords };

