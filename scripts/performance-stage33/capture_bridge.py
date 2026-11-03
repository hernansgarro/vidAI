#!/usr/bin/env python3
"""Read-only capture bridge. A trial runs once; HEADER/CHUNK requests are idempotent.
Use explicit ACK only after the archive has a durable external copy.
Never use RUN to replace a missing scientific outcome without recorded approval.
"""
import os,sys,json,subprocess,termios,base64,hashlib,gzip
attr=termios.tcgetattr(0);attr[3]&=~(termios.ICANON|termios.ECHO);termios.tcsetattr(0,termios.TCSANOW,attr)
outcome=None;encoded=None;pending=b""
def send(value):print(json.dumps(value),flush=True)
def header():
 if outcome is None:return {"state":"not-run"}
 return {"state":"captured","receipt":outcome["receipt"],"characters":len(encoded),"parts":(len(encoded)+11999)//12000}
send({"state":"ready","commands":["RUN","HEADER","CHUNK n","ACK blob-sha"]})
while True:
 while b"\n" not in pending:
  chunk=os.read(0,65536)
  if not chunk:sys.exit(0)
  pending+=chunk
 line,pending=pending.split(b"\n",1);command=line.decode().strip()
 if command=="RUN":
  if outcome is not None:send(header());continue
  if os.environ.get("VIDA_STAGE33_BRIDGE_DUMMY")=="1":
   archive=gzip.compress(json.dumps({"dummy":True,"data":list(range(10000))}).encode(),mtime=0)
   outcome={"receipt":{"dummy":True,"archiveSHA256":hashlib.sha256(archive).hexdigest(),"gitBlobSHA":hashlib.sha1(b"blob "+str(len(archive)).encode()+bytes([0])+archive).hexdigest()}}
   encoded=base64.b64encode(archive).decode()
  else:
   r=subprocess.run([os.environ.get("VIDA_STAGE33_NODE","node"),"--expose-gc","--input-type=module","-e",os.environ["VIDA_STAGE33_CODE"]],capture_output=True,text=True,timeout=20,env={**os.environ,"NODE_DISABLE_COMPILE_CACHE":"1"})
   lines=[x for x in r.stdout.splitlines() if x.startswith("STAGE33_RESULT=")]
   if len(lines)!=1:send({"state":"failed-capture","returncode":r.returncode,"stdout":r.stdout,"stderr":r.stderr});sys.exit(1)
   outcome=json.loads(lines[0].split("=",1)[1]);encoded=outcome.pop("archive")
   outcome["receipt"]["processReturncode"]=r.returncode;outcome["receipt"]["stderr"]=r.stderr
  send(header())
 elif command=="HEADER":send(header())
 elif command.startswith("CHUNK "):
  try:
   index=int(command.split()[1]);assert outcome is not None and index>=0
   data=encoded[index*12000:(index+1)*12000];assert data
   send({"part":index,"data":data,"last":(index+1)*12000>=len(encoded)})
  except Exception as e:send({"state":"invalid-request","reason":str(e)})
 elif command.startswith("ACK "):
  if outcome is not None and command.split()[1]==outcome["receipt"]["gitBlobSHA"]:
   send({"state":"acknowledged","trialMayNotBeRepeated":True});sys.exit(0)
  send({"state":"invalid-ack"})
 else:send({"state":"invalid-request","trialWasNotRepeated":True})
