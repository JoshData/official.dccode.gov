// Turn each selected element into a padlock.
jQuery.fn.extend({
	padlock: function(options) {
		function detect_browser() {
			if (bowser.chrome)
				return "chrome35";

			if (bowser.firefox && parseInt(bowser.version) >= 14)
				return "firefox32";
			if (bowser.firefox) // actually only valid >= 8
				return "firefox8";

			if (bowser.msie && parseInt(bowser.version) >= 9)
				return "ie9";
			if (bowser.msie && parseInt(bowser.version) == 8)
				return "ie8";
			if (bowser.msie && parseInt(bowser.version) == 7)
				return "ie7";

			if (bowser.opera && parseInt(bowser.version) >= 15)
				return "opera15";

			if (bowser.safari) // actually only valid for 4-5
				return "safari5";

			return "unknown";
			//alert(parseInt(bowser.version))
		}

		function make_padlock(elem) {
			// get options

			var browser = 
				   elem.attr("data-padlock-browser")
				|| (options && options.browser)
				|| detect_browser();

			var domain = 
				   elem.attr("data-padlock-domain")
				|| (options && options.domain)
				|| window.location.hostname
				|| "www.example.org";

			var path = 
				   elem.attr("data-padlock-path")
				|| (options && options.path)
				|| (window.location.hostname && window.location.pathname)
				|| "/file.html";

			var evIdentity = 
				   elem.attr("data-padlock-ev-identity")
				|| (options && options.evIdentity)
				|| null;

			// set div template

			elem.html(
				  "<div class='padlock-example'>"
				+ "  <div class='padlock-box'>"
			    + "    <div class='padlock-document-icon'></div>"
			    + "    <div class='padlock-icon-container'>"
			    + "      <div class='padlock-icon'></div>"
			    + "      <div class='padlock-icon-identity'></div>"
			    + "    </div>"
			    + "    <div class='padlock-url'>"
			    + "      <span class='padlock-url-scheme'> </span>"
			    + "<span class='padlock-url-colonslashslash'> </span>"
			    + "<span class='padlock-url-domain'> </span>"
			    + "<span class='padlock-url-path'> </span>"
			    + "    </div>"
			    + "    <div style='clear: both'></div>"
			    + "  </div>"
				+ "  <div class='padlock-instructions'>"
			    + "  </div>"
			    + "</div>"
			    )

			// set static text

			elem.find('.padlock-url-scheme').text('https')
			elem.find('.padlock-url-colonslashslash').text('://')
			elem.find('.padlock-url-domain').text(domain)
			elem.find('.padlock-url-path').text(path)

			// set classes

			elem.find('.padlock-box').addClass('padlock-browser-' + browser)
			if (evIdentity) {
				if (browser == "firefox32" || browser == "firefox8") {
					// Expect the country code in brackets at the end, but for Firefox
					// display it with parens.
					evIdentity = evIdentity.replace(/\[(..)\]$/, "($1)")
				}

				elem.find('.padlock-box').addClass('padlock-cert-ev')
				elem.find('.padlock-icon-identity').text(evIdentity)
			} else {
				elem.find('.padlock-icon-identity').text(domain)
			}

			// instructions

			var inx;
			if (browser == "chrome35" && !evIdentity)
				inx = "Look for a <span>green lock</span> and “DOMAIN” in <span>dark text</span>.";
			else if (browser == "chrome35" && evIdentity)
				inx = "Look for a <span>green lock</span>, the <span>company name</span>, and “DOMAIN” in <span>dark text</span>.";
			
			else if (browser == "firefox32" && !evIdentity)
				inx = "Look for a <span>lock</span> and “DOMAIN” in <span>dark text</span>.";
			else if (browser == "firefox32" && evIdentity)
				inx = "Look for a <span>green lock</span>, the <span>company name</span>, and “DOMAIN” in <span>dark text</span>.";
			else if (browser == "firefox8" && !evIdentity)
				inx = "Look for “DOMAIN” in <span>blue</span> on the left and then again in <span>dark text</span> on the right.";
			else if (browser == "firefox8" && evIdentity)
				inx = "Look for the <span>company name</span> in <span>green</span> and “DOMAIN” in <span>dark text</span>.";
			
			else if (browser == "ie9" && !evIdentity)
				inx = "Look for a <span>blue bar</span>, “DOMAIN” in <span>dark text</span>, and a <span>lock</span> on the right.";
			else if (browser == "ie9" && evIdentity)
				inx = "Look for a <span>green bar</span>, “DOMAIN” in <span>dark text</span>, and the <span>company name</span> and a <span>lock</span> on the right.";
			else if (browser == "ie8" && !evIdentity)
				inx = "Look for a <span>blue bar</span>, “DOMAIN” in <span>dark text</span>, and a <span>lock</span> on the right.";
			else if (browser == "ie8" && evIdentity)
				inx = "Look for a <span>green bar</span>, “DOMAIN” in <span>dark text</span>, and the <span>company name</span> and a <span>lock</span> on the right.";
			else if (browser == "ie7" && !evIdentity)
				inx = "Look for a <span>blue bar</span> and a <span>lock</span> on the right.";
			else if (browser == "ie7" && evIdentity)
				inx = "Look for a <span>green bar</span> and the <span>company name</span> and a <span>lock</span> on the right.";
			
			else if (browser == "opera15" && !evIdentity)
				inx = "Look for a <span>green lock</span> and “DOMAIN” in <span>dark text</span>.";
			else if (browser == "opera15" && evIdentity)
				inx = "Look for a <span>green lock</span>, the <span>company name</span>, and “DOMAIN” in <span>dark text</span>.";
			
			else if (browser == "safari5" && !evIdentity)
				inx = "Look for a <span>lock</span> on the right.";
			else if (browser == "safari5" && evIdentity)
				inx = "Look for the <span>company name</span> and a <span>lock</span> both on the right.";

			else
				inx = "This example is approximate. Look for a <span>lock</span> icon and “DOMAIN.”"

			inx = inx.replace(/DOMAIN/, domain);

			elem.find('.padlock-instructions').html(inx)


		}

		return this.each(function() {
			make_padlock($(this));
		});
	}
})
