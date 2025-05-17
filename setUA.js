// 强制设置 User-Agent 为 Loon
let headers = $request.headers;
headers['User-Agent'] = 'Loon/853 CFNetwork/1498.700.2 Darwin/23.6.0';
$done({ headers });
