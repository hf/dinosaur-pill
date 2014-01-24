mocha.checkLeaks();
mocha.globals(['Zepto', 'jQuery', '$', '_', 'Backbone', 'URI', 'WebView']);

mocha.run();
