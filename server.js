const net = require('net');
const { spawn } = require('child_process')


var server = net.createServer()

server.on('close', () => {
  console.log('client disconnected');
});

server.on('connection', socket => {
  console.log(socket.remoteAddress.toString() + ' connected.');
  socket.write('welcome to server');
  // command를 연속적으로 대화형으로 실행시키기 위해서는 아래와 같이 bash를 실행시키고
  // 유지시켜줘야함
  const command = spawn('/bin/bash');

  // 사용자 입력값이 들어오면 data를 command에 날림
  socket.on('data', data => {
    console.log(data.toString());
    if(data == 'close()' || data == 'exit') {
      socket.end();
    }
    command.stdin.write(data);
  });

  command.stdout.on('data', data => {
    console.log(data.toString())
    socket.write(`stdout : ${data}`);
  });

  command.stderr.on('data', (data) => {
    socket.write(`stderr: ${data}`);
  });
  
  command.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });

  // 사용자 연결이 종료되면 bash process kill
  socket.on('end', code => {
    console.log('shell terminated..');
    command.kill();
  })

})

server.on('error', err => {
  console.log('err' + err);
});

server.listen(3001, () =>{
  console.log('listening on 3001...');
});