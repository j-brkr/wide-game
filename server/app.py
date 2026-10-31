from flask import Flask, jsonify
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler

import math
import random

EARTH_CIRCUMFERENCE = 40_007_863

app = Flask(__name__)
CORS(app)

class Zone:
    def __init__(self, center: tuple, radius: float):
        self.center: tuple = center
        self.radius: float = radius

    def to_dict(self):
        return {
            "center": self.center,
            "radius": self.radius
        }

def get_random_coords(radius):
    theta = random.uniform(0, 2 * math.pi)
    r = radius * math.sqrt(random.random())
    x = r * math.cos(theta)
    y = r * math.sin(theta)
    return x, y

class Game:
    def __init__(self, game_length_seconds: int = 1200):
        self.last_zone: Zone = Zone((-31.9800, 115.8179), 500)
        self.next_zone = None
        self.game_length_seconds: int = game_length_seconds
        self.zone_wait_seconds: int = 5
        self.zone_show_seconds: int = 5
        self.zone_shrink_seconds: int = 10
        self.zone_shrink_factor: float = 0.8
        self.zone_mode = "wait"
        self.zone_countdown = self.zone_wait_seconds
        self.time_elapsed: float = 0

    def get_zone(self):
        if self.zone_mode == "shrink":
            if self.next_zone:
                progress = 1 - (self.zone_countdown / self.zone_shrink_seconds)
                current_center = self.last_zone.center[0] * (1-progress) + self.next_zone.center[0] * progress, \
                                 self.last_zone.center[1] * (1-progress) + self.next_zone.center[1] * progress
                current_radius = self.last_zone.radius * (1-progress) + self.next_zone.radius * progress
                return Zone(current_center, current_radius)
            else:
                print("ERROR: Cannot shrink as there is no next zone")
        return self.last_zone

    def get_new_zone(self):
        new_radius = self.last_zone.radius * self.zone_shrink_factor
        x_change, y_change = get_random_coords(self.last_zone.radius - new_radius * 0.75)
        lat_change = y_change * 360 / EARTH_CIRCUMFERENCE
        long_change = x_change * 360 / (math.pi * math.pow((EARTH_CIRCUMFERENCE * math.cos(math.radians(self.last_zone.center[0]))), 2))
        new_center = self.last_zone.center[0] + lat_change, self.last_zone.center[1] + long_change
        return Zone(new_center, new_radius)

    def tick(self):
        self.time_elapsed+= 1
        self.zone_countdown-= 1
        if self.zone_countdown <= 0:
            if self.zone_mode == "wait":
                self.next_zone = self.get_new_zone()
                self.zone_mode = "show"
                self.zone_countdown = self.zone_show_seconds
            elif self.zone_mode == "show":
                self.zone_mode = "shrink"
                self.zone_countdown = self.zone_shrink_seconds
            elif self.zone_mode == "shrink":
                if self.next_zone:
                    self.last_zone = self.next_zone
                    self.next_zone = None
                    self.zone_mode = "wait"
                    self.zone_countdown = self.zone_wait_seconds
                else:
                    print("ERROR: next_zone in nonexistent!")

    def to_dict(self):
        return {
            "zone": self.get_zone().to_dict(),
            "next_zone": self.next_zone.to_dict() if self.next_zone else None,
            "time_elapsed": self.time_elapsed
        }


game = Game(game_length_seconds=1200)
scheduler = BackgroundScheduler()
scheduler.add_job(game.tick, "interval", seconds=1)
scheduler.start()

@app.route("/")
def game_data():
    return jsonify(game.to_dict())