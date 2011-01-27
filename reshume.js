var KC_BACKSPACE = 8,
    KC_NEWLINE = 13,
    KC_LEFT = 37,
    KC_UP = 38,
    KC_RIGHT = 39,
    KC_DOWN = 40;

function Console() {
    // the table we'll be manipulating
    this.console = document.getElementById("console");
    // command buffer, in reverse chronological order
    this.buffer = [""];
    // current cursor position
    this.currentpos = 0;
    // the shell prompt
    this.prompt = '<span class="cyantext">[</span>%pwd<span class="cyantext">]</span>$ ';
    // current working directory
    this.pwd = "/resume";

    // handle onKeyPress, which only fires events for normal keys
    this.normalKey = function(event) {
        var keycode = this.getKeyCode(event);

        switch(keycode) {
            // skip the events handled by controlKey
            case KC_BACKSPACE: case KC_NEWLINE:
            case KC_LEFT: case KC_RIGHT:
                return;
        }

        var key = String.fromCharCode(keycode);
        if(this.currentpos >= this.buffer[0].length) {
            this.buffer[0] += key;
        } else {
            var buf = this.buffer[0];
            this.buffer[0] = buf.substr(0, this.currentpos);
            this.buffer[0] += key;
            this.buffer[0] += buf.substr(this.currentpos);
        }

        ++this.currentpos;
        this.update();
    };

    // handle control characters like backspace and delete
    // the events are only fired by onKeyDown
    this.controlKey = function(event) {
        switch(this.getKeyCode(event)) {
            case KC_BACKSPACE:
                if(this.currentpos > 0) {
                    if(this.currentpos >= this.buffer[0].length) {
                        this.buffer[0] = this.buffer[0].substr(0, this.buffer[0].length - 1);
                    } else {
                        var buf = this.buffer[0];
                        this.buffer[0] = buf.substr(0, this.currentpos - 1);
                        this.buffer[0] += buf.substr(this.currentpos);
                    }
                    --this.currentpos;
                    this.update();
                } else {
                    this.beep();
                }
                break;
            case KC_NEWLINE:
                // remove the cursor from the current command
                var row = this.console.rows[this.console.rows.length - 1];
                var prompt = this.prompt.replace("%pwd", this.pwd);
                row.innerHTML = '<td><pre>' + prompt + this.buffer[0] + '</pre></td>';

                this.console.insertRow(this.console.rows.length);
                this.buffer.unshift("");
                this.update();
                break;
            case KC_LEFT:
                if(this.currentpos > 0) {
                    --this.currentpos;
                    this.update();
                } else {
                    this.beep();
                }
                break;
            case KC_RIGHT:
                if(this.currentpos < this.buffer[0].length) {
                    ++this.currentpos;
                    this.update();
                } else {
                    this.beep();
                }
        }
    };

    this.update = function () {
        var row = this.console.rows[this.console.rows.length - 1];
        var prompt = this.prompt.replace("%pwd", this.pwd);
        var html;

        if(!this.buffer[0].charAt(this.currentpos)) {
            // cursor at end of line
            html = prompt + this.buffer[0] + '<span id="cursor">&nbsp;</span>';
        } else {
            var early = this.buffer[0].substr(0, this.currentpos);
            var late = this.buffer[0].substr(this.currentpos + 1);
            html = prompt + early + '<span id="cursor">' +
                    this.buffer[0].charAt(this.currentpos) + '</span>' + late;
        }

        row.innerHTML = '<td><pre>' + html + '</pre></td>';
    };

    this.getKeyCode = function(event) {
        var keycode = event.keyCode; // IE or Webkit
        if(!keycode) {
            keycode = event.which;   // Firefox or Opera
        }
        return keycode;
    };

    this.beep = function() {
        // FIXME: figure out visual beep
    };

    this.update();
}
