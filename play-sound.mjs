import playSound from "play-sound";

export function playNotificationSound() {
  const player = playSound({ opts: {} });

  player.play("notification-sound.wav", function (err) {
    if (err) {
      console.log(err);
      throw err;
    }
  });
}
