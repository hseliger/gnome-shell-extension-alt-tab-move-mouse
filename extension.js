// Copyright (C) 2021  Taiki Sugawara

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// Before Gnome 45: const { Clutter, Meta } = imports.gi;
import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
// Before Gnome 45: const Main = imports.ui.main;
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class AltTabExtension  {
  constructor() {
    this._handler = null;
  }
 
  /* exported enable */
  enable() {
    this.origMethods = {
      "Main.activateWindow": Main.activateWindow
    };
    Main.activateWindow = (window, ...args) => {
      this.movePointerMaybe(window);
      this.origMethods["Main.activateWindow"](window, ...args);
    };
    const seat = Clutter.get_default_backend().get_default_seat();
    this.vdevice = seat.create_virtual_device(
      Clutter.InputDeviceType.POINTER_DEVICE
    );
  }

  /* exported disable */
  disable() {
    this._seat = null;
}

  destroy() {
    Main.activateWindow = this.origMethods["Main.activateWindow"];
  }

  movePointerMaybe(window) {
    if (!this.pointerAlreadyOnWindow(window)) {
      const rect = window.get_frame_rect();
      const x = rect.x + rect.width / 2;
      const y = rect.y + rect.height / 2;

      this.vdevice.notify_absolute_motion(global.get_current_time(), x, y);
    }
  }

  pointerAlreadyOnWindow(window) {
    const [x, y] = global.get_pointer();
    const rect = new Meta.Rectangle({ x, y, width: 1, height: 1 });
    return rect.intersect(window.get_frame_rect())[0];
  }
}
