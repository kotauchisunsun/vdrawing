<template>
  <div class="home">
    <div id="pixi_canvas"></div>
    <button @click="clear">全削除</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
import * as PIXI from 'pixi.js';
import LineRepositoryInterface from '@/LineRepositoryInterface';
import Line from '@/Line';
import Point from '@/Point';
import { setInterval } from 'timers';

@Component({
  components: {
    HelloWorld,
  },
})

export default class Home extends Vue {
  @Prop()
  private repository!: LineRepositoryInterface;
  private app!: PIXI.Application;

  private async clear(): Promise<void> {
    this.repository.clear();
    this.app.stage.removeChildren();
  }

  private async mounted(): Promise<void> {
    this.app = new PIXI.Application(800, 600, {antialias: true});
    const element = document.getElementById('pixi_canvas');
    this.app.renderer.backgroundColor = 0xeeeeee;
    if (element !== null) {
      element.appendChild(this.app.view);
    }

    const history: Array<[number, number]> = [];
    const view = this.app.view;
    let onDraw = false;

    const refreshCanvas = async () => {
      this.repository.gets().then( (lines: Line[] ) => {
        const graphics: PIXI.Graphics[] = [];

        lines.forEach( (line: Line) => {
          for (let i = 0; i < line.points.length - 1; i++) {
            const p0 = line.points[i];
            const p1 = line.points[i + 1];
            const g = new PIXI.Graphics();
            g.lineStyle(1, 0x000000).moveTo(p0.x, p0.y).lineTo(p1.x, p1.y);
            graphics.push(g);
          }
        });

        this.app.stage.removeChildren();
        graphics.forEach( (g: PIXI.Graphics) => {
          this.app.stage.addChild(g);
        });
        this.app.render();
      });
    };

    await refreshCanvas();

    setInterval(
      () => {
        if (!onDraw) {
          refreshCanvas();
        }
      }, 1000 * 10,
    );

    const drawLine = (event: PointerEvent): PIXI.Graphics => {
      const x = event.layerX;
      const y = event.layerY;

      history.push([x, y]);

      const p1 = history[history.length - 2];
      const p2 = history[history.length - 1];

      const g = new PIXI.Graphics();
      g.lineStyle(1, 0x000000).moveTo(p1[0], p1[1]).lineTo(p2[0], p2[1]);

      return g;
    };

    const finishLine = async (event: PointerEvent): Promise<void> => {
      if (onDraw) {
        const g = drawLine(event);
        this.app.stage.addChild(g);
        this.app.render();

        const points: Point[] = Array.from(
          history.map( (x: [number, number]) => new Point(x[0], x[1])),
        );

        this.repository.set(
          new Line(
            points,
            new Date(),
          ),
        );

        onDraw = false;
        history.splice(0, history.length);
      }
    };

    view.onpointerdown = async (event: PointerEvent): Promise<any> => {
      const x = event.layerX;
      const y = event.layerY;
      onDraw = true;
      history.push([x, y]);
    };

    view.onpointermove = async (event: PointerEvent): Promise<any> => {
      if (onDraw) {
        const g = drawLine(event);
        this.app.stage.addChild(g);
        this.app.render();
      }
    };

    view.onpointerout = async (event: PointerEvent): Promise<any> => {
      await finishLine(event);
    };

    view.onpointerup = async (event: PointerEvent): Promise<any> => {
      await finishLine(event);
    };
  }
}
</script>
