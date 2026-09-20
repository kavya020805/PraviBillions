const net = require('net');
const tls = require('tls');

const regions = [
  'ap-south-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1', 'eu-central-2',
  'ca-central-1', 'sa-east-1', 'me-central-1', 'af-south-1'
];
const user = 'postgres.vyixntenvmrxrsezxwyt';
const database = 'postgres';

async function testRegion(region) {
  return new Promise((resolve) => {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const socket = net.createConnection(5432, host);
    socket.setTimeout(4000);

    socket.on('connect', () => {
      // Postgres SSLRequest packet: length 8, code 80877103
      const sslReq = Buffer.alloc(8);
      sslReq.writeInt32BE(8, 0);
      sslReq.writeInt32BE(80877103, 4);
      socket.write(sslReq);
    });

    socket.once('data', (data) => {
      if (data[0] === 83) { // 'S' for SSL supported
        const tlsSocket = tls.connect({
          socket: socket,
          servername: host,
          rejectUnauthorized: false,
        }, () => {
          // Send StartupMessage
          // Format: Length (Int32), Protocol (Int32: 196608 = 3.0), user\0<user>\0database\0<database>\0\0
          const params = `user\0${user}\0database\0${database}\0\0`;
          const len = 4 + 4 + Buffer.byteLength(params);
          const startup = Buffer.alloc(len);
          startup.writeInt32BE(len, 0);
          startup.writeInt32BE(196608, 4);
          startup.write(params, 8);
          tlsSocket.write(startup);
        });

        tlsSocket.on('data', (tlsData) => {
          const type = String.fromCharCode(tlsData[0]);
          const msg = tlsData.toString('utf8');
          // 'R' is Authentication request, 'E' is ErrorResponse
          if (type === 'R') {
            console.log(`>>> SUCCESS! Region found: ${region} (Auth requested: ${tlsData.readInt32BE(5)})`);
            tlsSocket.destroy();
            resolve({ region, success: true });
          } else if (type === 'E') {
            if (msg.includes('Tenant or user not found')) {
              // Not in this region
              resolve({ region, success: false, reason: 'not_in_region' });
            } else {
              console.log(`Region ${region} response:`, msg.substring(0, 100));
              resolve({ region, success: true, reason: msg });
            }
          }
          tlsSocket.destroy();
        });

        tlsSocket.on('error', () => resolve({ region, success: false }));
      } else {
        socket.destroy();
        resolve({ region, success: false });
      }
    });

    socket.on('error', () => resolve({ region, success: false }));
    socket.on('timeout', () => { socket.destroy(); resolve({ region, success: false }); });
  });
}

async function run() {
  console.log('Testing Supabase pooler regions for tenant vyixntenvmrxrsezxwyt...');
  for (const r of regions) {
    const res = await testRegion(r);
    if (res.success && !res.reason?.includes('not found')) {
      console.log(`FOUND ACTUAL MATCH: ${r}`);
    }
  }
  console.log('Done testing regions.');
}

run();
