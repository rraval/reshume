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
            case 8: case 13: case 37: case 39:
                return;
        }

        // FIXME: insert characters based on currentpos!
        this.buffer[0] += String.fromCharCode(this.getKeyCode(event));
        ++this.currentpos;
        this.update();
    };

    // handle control characters like backspace and delete
    // the events are only fired by onKeyDown
    this.controlKey = function(event) {
        switch(this.getKeyCode(event)) {
            case 8: // backspace
                if(this.currentpos > 0) {
                    this.buffer[0] = this.buffer[0].substr(0, this.buffer[0].length - 1);
                    --this.currentpos;
                    this.update();
                } else {
                    this.beep();
                }
                break;
            case 13:
                // remove the cursor from the current command
                var row = this.console.rows[this.console.rows.length - 1];
                var prompt = this.prompt.replace("%pwd", this.pwd);
                row.innerHTML = '<td><pre>' + prompt + this.buffer[0] + '</pre></td>';

                this.console.insertRow(this.console.rows.length);
                this.buffer.unshift("");
                this.update();
                break;
            case 37: // left key
                if(this.currentpos > 0) {
                    --this.currentpos;
                    this.update();
                } else {
                    this.beep();
                }
                break;
            case 39: // right key
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
            keycode = event.which; // Firefox or Opera
        }
        return keycode;
    };

    this.beep = function() {
        // FIXME: figure out visual beep
    };

    this.update();
}
