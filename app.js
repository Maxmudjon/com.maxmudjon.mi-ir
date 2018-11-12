'use strict';
const Homey = require('homey');

class MIIR extends Homey.App {
	
	onInit() {
		this.log('Mi IR is running...');
	}

}

module.exports = MIIR;