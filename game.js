kaboom({
  global: true,
  width: 1200,
  height: 580,
  scale: 1,
})

loadRoot('https://i.imgur.com/')
loadSprite('space-invader', 'xm4uekq.png')
loadSprite('space-ship', 'yxiLtVW.png')
loadSprite('wall', 'fCKsBPE.png')

scene('game', () => {
  const MOVE_SPEED = 300
  const BULLET_SPEED = 320
  const INVADER_SPEED = 150
  const LEVEL_DOWN = 58
  let CURRENT_SPEED = INVADER_SPEED

  layers(['obj', 'ui'], 'obj')

  addLevel(
    [
      '!^^^^^^^^^^   &',
      '!^^^^^^^^^^   &',
      '!^^^^^^^^^^   &',
      '!             &',
      '!             &',
      '!             &',
      '!             &',
      '!             &',
      '!             &',
      '!             &',
    ],
    {
      // TODO: derive grid size from sprite size instead of hardcode
      // grid size
      width: 80,
      height: 58,
      // define each object as a list of components
      '^': [sprite('space-invader'), solid(), scale(0.7), 'space-invader'],
      '!': [sprite('wall'), solid(), 'left-side'],
      '&': [sprite('wall'), solid(), 'right-side'],
    },
    pos(width() / 2, height() / 2),
    origin('center'),
  )
  function lifespan(time) {
    let timer = 0
    return {
      update() {
        timer += dt()
        if (timer >= time) {
          destroy(this)
        }
      },
    }
  }

  function late(t) {
    let timer = 0
    return {
      add() {
        this.hidden = true
      },
      update() {
        timer += dt()
        if (timer >= t) {
          this.hidden = false
        }
      },
    }
  }

  add([
    text('READY', 24),
    pos(width() / 2, height() / 2),
    origin('center'),
    lifespan(1),
    layer('ui'),
  ])

  add([
    text('STEADY', 24),
    pos(width() / 2, height() / 2),
    origin('center'),
    lifespan(2),
    late(1),
    layer('ui'),
  ])

  add([
    text('GO', 40),
    pos(width() / 2, height() / 2),
    origin('center'),
    lifespan(4),
    late(2),
    layer('ui'),
  ])

  const score = add([
    text('0'),
    pos(50, 500),
    scale(2),
    layer('ui'),
    {
      value: 0,
    },
  ])

  const timer = add([
    text(0),
    pos(50, 530),
    scale(2),
    layer('ui'),
    {
      time: 60,
    },
  ])

  timer.action(() => {
    timer.time -= dt()
    timer.text = timer.time.toFixed(2)
    if (timer.time <= 0) {
      go('lose', score.value)
    }
  })

  const player = add([
    sprite('space-ship'),
    scale(0.7),
    layer('obj'),
    pos(width() / 2, height() - 58),
    origin('center'),
  ])

  keyDown('left', () => {
    player.move(-MOVE_SPEED, 0)
  })

  keyDown('right', () => {
    player.move(MOVE_SPEED, 0)
  })

  function spawnBullet(p) {
    add([rect(6, 18), pos(p), origin('center'), color(0.5, 0.5, 1), 'bullet'])
  }

  keyPress('space', () => {
    spawnBullet(player.pos.add(0, -25))
  })

  // run this callback every frame for all objects with tag "bullet"
  action('bullet', (b) => {
    b.move(0, -BULLET_SPEED)
    // remove the bullet if it's out of the scene for performance
    if (b.pos.y < 0) {
      destroy(b)
    }
  })

  collides('bullet', 'space-invader', (b, s) => {
    camShake(4)
    destroy(b)
    destroy(s)
    score.value++
    score.text = score.value
  })

  action('space-invader', (s) => {
    s.move(CURRENT_SPEED, 0)
  })

  collides('space-invader','right-side', () => {
    CURRENT_SPEED = -INVADER_SPEED
    every('space-invader', (obj) => {
      obj.move(0, LEVEL_DOWN)
    })
  })

  collides('space-invader', 'left-side', () => {
    CURRENT_SPEED = INVADER_SPEED
    every('space-invader', (obj) => {
      obj.move(0, LEVEL_DOWN)
    })
  })

  player.collides('space-invader', () => {
    go('lose', score.value)
  })
  
  action('space-invader', (s) => {
		if (s.pos.y >= height()) {
			// switch to "death" scene
			go("lose", score.value);
		}
	})
})

 
scene('lose', (score) => {
  add([
    text(score),
    origin('center'),
    scale(10),
    pos(width() / 2, height() / 2),
  ])
})

start('game')
