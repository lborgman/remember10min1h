module.exports = {
	globDirectory: 'public/',
	globPatterns: [
		'**/*.{html,css,svg,js,png,json}'
	],
	ignoreURLParametersMatching: [
		/^404.html/,
		/^utm_/,
		/^fbclid$/
	],
	swSrc: 'public/sw-workbox-input.js',
	swDest: 'public/sw-workbox.js'
};