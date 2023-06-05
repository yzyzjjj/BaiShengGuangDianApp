;
! function(a, b) {
	console.log(1)
}


//二维码扫描模态框
function showPrintModal(resolve) {
    //resolve("1,JYDKJFSQ,1425");
    //return;
    if (_showPrintModal)
        return;
    _showPrintModal = true;
    const modalId = '_printModal';
    const html = minimize(
        `<div class="modal fade" id="${modalId}" style="z-index:9999" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-dialog">
               <div class="modal-content">
                   <div class="modal-header">
                       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                       <h4 class="modal-title"></h4>
                   </div>
                   <div class="modal-body" style="position:relative">
                        <div class="qrcode-box" style="position:absolute;left:50%;transform:translateX(-50%);width:300px;height:300px">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <video style="width: 100%;height:300px"></video>
                        <canvas class="hidden" width="300" height="300"></canvas>
                   </div>
                   <div class="modal-footer">
                       <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
                   </div>
               </div>
           </div>
        </div>`);
    var modal = $(html);
    $(".content").append(modal);
    var closeVideo, canvasImg, qrCode = null;
    var video = $('#_printModal video')[0];
    var canvas = $('#_printModal canvas')[0];
    var context = canvas.getContext('2d');
    modal.on('hidden.bs.modal',
        function () {
            if (closeVideo) {
                closeVideo.stop();
            }
            if (canvasImg) {
                clearInterval(canvasImg);
            }
            resolve(qrCode);
            modal.remove();
            _showPrintModal = false;
        });
    $(document).on("visibilitychange", function () {
        var page = this.visibilityState;
        if (page == "hidden") {
            modal.modal('hide');
            _showPrintModal = false;
        }
    });
    var getUserMedia = (constraints, success, error) => {
        if (navigator.mediaDevices.getUserMedia) {
            //最新的标准API
            navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);
        } else if (navigator.webkitGetUserMedia) {
            //webkit核心浏览器
            navigator.webkitGetUserMedia(constraints).then(success).catch(error);
        } else if (navigator.mozGetUserMedia) {
            //firfox浏览器
            navigator.mozGetUserMedia(constraints).then(success).catch(error);
        } else if (navigator.getUserMedia) {
            //旧版API
            navigator.getUserMedia(constraints).then(success).catch(error);
        }
    }
    var capture = () => {
        context.drawImage(video, 0, 0, 300, 300);
        qrcode.decode(canvas.toDataURL('image/png'));
        qrcode.callback = (e) => {
            //结果回调
            if (e != "error decoding QR Code") {
                if (/,/.test(e)) {
                    qrCode = e;
                    clearInterval(canvasImg);
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    modal.modal('hide');
                } else {
                    alert(e);
                }
            }
        }
    }
    if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
        //调用用户媒体设备, 访问摄像头
        getUserMedia({
            video: {
                width: 500,
                height: 500,
                //user前置摄像头
                facingMode: { exact: "environment" }
            }
        }, (stream) => {
            modal.modal("show");
            video.srcObject = stream;
            video.play();
            closeVideo = stream.getTracks()[0];
            canvasImg = setInterval(capture, 500);
        }, () => {
            modal.modal('hide');
            layer.msg("访问用户媒体设备失败");
            _showPrintModal = false;
        });
    } else {
        modal.modal('hide');
        layer.msg('不支持访问用户媒体');
        _showPrintModal = false;
    }
}