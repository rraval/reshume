var KC_BACKSPACE = 8,
    KC_NEWLINE = 13,
    KC_LEFT = 37,
    KC_UP = 38,
    KC_RIGHT = 39,
    KC_DOWN = 40;

function Console() {
    // the table we'll be manipulating
    this.console = document.getElementById("console");
    // history of commands, in reverse chronological order
    this.history = [];
    // used for editing history
    this.histbuffer = null;
    this.histbuffer_pos = null;
    // command buffer
    this.buffer = "";
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
            case KC_UP: case KC_DOWN:
                return;
        }

        var key = String.fromCharCode(keycode);
        if(this.currentpos >= this.buffer.length) {
            this.buffer += key;
        } else {
            var buf = this.buffer;
            this.buffer = buf.substr(0, this.currentpos);
            this.buffer += key;
            this.buffer += buf.substr(this.currentpos);
        }

        ++this.currentpos;
        this.update();

        return false;
    };

    // handle control characters like backspace and delete
    // the events are only fired by onKeyDown
    this.controlKey = function(event) {
        switch(this.getKeyCode(event)) {
            case KC_BACKSPACE:
                if(this.currentpos > 0) {
                    if(this.currentpos >= this.buffer.length) {
                        this.buffer = this.buffer.substr(0, this.buffer.length - 1);
                    } else {
                        var buf = this.buffer;
                        this.buffer = buf.substr(0, this.currentpos - 1);
                        this.buffer += buf.substr(this.currentpos);
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
                row.innerHTML = '<td><pre>' + prompt + this.buffer + '</pre></td>';

                // delete any history editing
                this.histbuffer = null;
                this.histbuffer_pos = null;

                this.console.insertRow(this.console.rows.length);
                this.history.push(this.buffer);
                this.buffer = "";
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
                if(this.currentpos < this.buffer.length) {
                    ++this.currentpos;
                    this.update();
                } else {
                    this.beep();
                }
                break;

            case KC_UP:
                if(this.histbuffer === null) {
                    // first time moving through history
                    if(this.history.length === 0) {
                        this.beep();
                        break;
                    } else {
                        this.histbuffer = [this.buffer,
                                           this.history[this.history.length - 1]];
                        this.histbuffer_pos = 1;
                        this.buffer = this.histbuffer[this.histbuffer_pos];
                        this.update();
                    }
                } else {
                    if(this.history.length <= this.histbuffer_pos) {
                        this.beep();
                        break;
                    }

                    if(this.histbuffer_pos + 1 >= this.histbuffer.length) {
                        this.histbuffer.push(this.history[this.history.length - this.histbuffer_pos - 1]);
                    }
                    this.histbuffer[this.histbuffer_pos] = this.buffer;
                    this.buffer = this.histbuffer[++this.histbuffer_pos];
                    this.update();
                }
                break;

            case KC_DOWN:
                if(this.histbuffer_pos === null || this.histbuffer_pos === 0) {
                    this.beep();
                    break;
                }

                this.histbuffer[this.histbuffer_pos] = this.buffer;
                this.buffer = this.histbuffer[--this.histbuffer_pos];
                this.update();

                break;
        }

        return false;
    };

    this.update = function () {
        var row = this.console.rows[this.console.rows.length - 1];
        var prompt = this.prompt.replace("%pwd", this.pwd);
        var html;

        if(!this.buffer.charAt(this.currentpos)) {
            // cursor at end of line
            html = prompt + this.buffer + '<span id="cursor">&nbsp;</span>';
        } else {
            var early = this.buffer.substr(0, this.currentpos);
            var late = this.buffer.substr(this.currentpos + 1);
            html = prompt + early + '<span id="cursor">' +
                    this.buffer.charAt(this.currentpos) + '</span>' + late;
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
        //alert("mother fucking beep!");
    };

    this.update();
}
