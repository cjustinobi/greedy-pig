import React, { useEffect, useRef } from 'react';

const Gpt: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const options = [1, 2, 3, 4, 5, 6];
  let startAngle = 0;
  const arc = Math.PI / (options.length / 2);
  let spinTimeout: NodeJS.Timeout | null = null;
  let spinTime = 0;
  let spinTimeTotal = 0;
  let ctx: CanvasRenderingContext2D | null = null;

  useEffect(() => {
    drawRouletteWheel();
  }, []);

  const byte2Hex = (n: number): string => {
    const nybHexString = '0123456789ABCDEF';
    return String(nybHexString.substr((n >> 4) & 0x0f, 1)) + nybHexString.substr(n & 0x0f, 1);
  };

  const RGB2Color = (r: number, g: number, b: number): string => {
    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
  };

  const getColor = (item: number, maxitem: number): string => {
    const phase = 0;
    const center = 128;
    const width = 127;
    const frequency = Math.PI * 2 / maxitem;

    let red = Math.sin(frequency * item + 2 + phase) * width + center;
    let green = Math.sin(frequency * item + 0 + phase) * width + center;
    let blue = Math.sin(frequency * item + 4 + phase) * width + center;

    return RGB2Color(red, green, blue);
  };

  const drawRouletteWheel = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const outsideRadius = 200;
      const textRadius = 160;
      const insideRadius = 125;

      ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        ctx.font = 'bold 12px Helvetica, Arial';

        for (let i = 0; i < options.length; i++) {
          const angle = startAngle + i * arc;
          ctx.fillStyle = getColor(i, options.length);

          ctx.beginPath();
          ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
          ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
          ctx.stroke();
          ctx.fill();

          ctx.save();
          ctx.shadowOffsetX = -1;
          ctx.shadowOffsetY = -1;
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'rgb(220,220,220)';
          ctx.fillStyle = 'black';
          ctx.translate(250 + Math.cos(angle + arc / 2) * textRadius,
            250 + Math.sin(angle + arc / 2) * textRadius);
          ctx.rotate(angle + arc / 2 + Math.PI / 2);
          const text = options[i];
          ctx.fillText(text.toString(), -ctx.measureText(text.toString()).width / 2, 0);
          ctx.restore();
        }

        // Arrow
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(250 - 4, 250 - (outsideRadius + 5));
        ctx.lineTo(250 + 4, 250 - (outsideRadius + 5));
        ctx.lineTo(250 + 4, 250 - (outsideRadius - 5));
        ctx.lineTo(250 + 9, 250 - (outsideRadius - 5));
        ctx.lineTo(250 + 0, 250 - (outsideRadius - 13));
        ctx.lineTo(250 - 9, 250 - (outsideRadius - 5));
        ctx.lineTo(250 - 4, 250 - (outsideRadius - 5));
        ctx.lineTo(250 - 4, 250 - (outsideRadius + 5));
        ctx.fill();
      }
    }
  };

  const spin = () => {
    startAngle = Math.random() * 10 + 10; // 10 to 19.999
    spinTime = 0;
    spinTimeTotal = 20000  // 4000 to 7999
    rotateWheel();
  };

  const rotateWheel = () => {
    spinTime += 30;
    if (spinTime >= spinTimeTotal || !ctx) {
      stopRotateWheel();
      return;
    }
    const spinAngle = startAngle - easeOut(spinTime, 0, startAngle, spinTimeTotal);
    startAngle += (spinAngle * Math.PI / 180);
    drawRouletteWheel();
    spinTimeout = setTimeout(rotateWheel, 30);
  };

  const stopRotateWheel = () => {
    if (spinTimeout) clearTimeout(spinTimeout);
    if (!ctx) return;
    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - degrees % 360) / arcd);
    ctx.save();
    ctx.font = 'bold 30px Helvetica, Arial';
    const text = options[index];
    ctx.fillText(text.toString(), 250 - ctx.measureText(text.toString()).width / 2, 250 + 10);
    ctx.restore();
  };

  const easeOut = (t: number, b: number, c: number, d: number) => {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
  };

  return (
    <div>
      <input type="button" value="Spin" style={{ float: 'left' }} id="spin" onClick={spin} />
      <canvas id="canvas" width="500" height="500" ref={canvasRef}></canvas>
    </div>
  );
}

export default Gpt;