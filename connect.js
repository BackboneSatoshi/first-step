function Connect(req, res) {
  this.route = '/';
  this.stack = [];
}

Connect.prototype.use = function(route, fn) {

  if('string' != typeof route) {
    fn = route;
    route = '/';
  }
  this.stack.push({ route: route, handle: fn});
};

Connect.prototype.handle = function(req, res, out) {
  var stack = this.stack;
  var index = 0;

  if(!out) {
    out = function(err) {
      if(err) {
        console.error('!Ops, Notice Error Occuring');
        console.error(err);
      }
      console.log('all done');
    };
  }

  function next(err) {
    
    var layer = stack[index++];

    // all done
    if(!layer) {
      out(err);
      return;
    }
    var handle = layer.handle;// コールバック
    var route = layer.route;// ルート
    
    
    // ここで本家connect.jsはクライアントが指定したルートとapp.useでパスを指定したときの
    //　パスを比較して、ハンドラーを呼び出すかどうかを決めると思う。
    var match = true;
    if(match) {
      // ポイント　callメソッドを呼び出すときに自分自身のnext関数を引数として渡して呼び出している
      call(handle, route, err, req, res, next);
    } else {
      next();
    }
  }// next 終了


  next();
};

function call(handle, route, err, req, res, next) {
  var arity = handle.length;
  console.log('atity length : ' + arity);
  var hasError = Boolean(err);

  if(hasError && arity === 4) {
    // error-handling middleware
    handle(err, req, res, next);
    return;
  } else if(!hasError && arity < 4) {
    // request-handling middleware
    handle(req, res, next);
    return;
  }
  // continue
  next(err);
}


/*初期化
var connect = new Connect();
var req = {};
var res = {};

使用方法
connect.use(function(req, res, next) {
  req.name = 'satoshi';
  res.render = function() {
    console.log('it is time  to rendering');
  };
  next();
});

connect.use(function(req, res, next) {
  req.age = '34';
  next();
});

エラーをキャッチする
エラーをキャッチする場合の引数の指定方法に注意
errを一番はじめの引数としておく
connect.use(function(err, req, res, next){
  console.log(err);
  next(err);
});



通常の呼び出し
connect.handle(req, res);

or 

ファイナルコールバックを指定して呼び出す。
connect.handle(req, res, function finalHandler() {
  console.log('登録関数呼び出しおわりー');
});

*/
