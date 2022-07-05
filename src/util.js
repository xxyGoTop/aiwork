import {
  MessageBox,
  Message,
} from 'element-ui';
import store from './store/index';
import xlsx from 'xlsx';

// 过滤空格
export const filterSpace = (val) => {
  if (typeof val === 'string') {
    return val.split('').filter(item => hasValue(item)).join('')
  }
  return val
}
// 无效值 invalid value
export const isInvalid = (val) => {
  if (Array.isArray(val)) return val.length === 0;
  if (typeof val === 'string') {
    val = val.trim();
    return val === '' || val === 'undefined' || val === 'null';
  }
  return val === undefined || val === null;
};

// 有效值 valid value
export const isValid = (val) => !isInvalid(val);

// 有效值 valid value
export const hasValue = (val) => !isInvalid(val);

// 基本类型值
export const basicType = (value) => (typeof value !== 'object' && typeof value !== 'function');

// 文件后缀
export const fileSuffix = (file) => {
  return (/.*\.(.*)$/.exec(file.name) || ['', ''])[1];
};

// 可以接受的文件类型
export const acceptTypes = (file, ...types) => {
  const suffix = fileSuffix(file);
  return types.some(type => (file.type === type || suffix === type));
}

// 下载文件
export const dlFile = (url, filename, suffix) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.${suffix}`;
  a.dispatchEvent(new MouseEvent('click'));
};

// 保存文件
export const saveFile = (content, filename, suffix) => {
  let url;
  if (content instanceof Blob) {
    url = URL.createObjectURL(content);
  } else if (typeof content === 'string') {
    url = URL.createObjectURL(new Blob([content]));
  } else if (content.constructor === Object || Array.isArray(content)) {
    url = URL.createObjectURL(new Blob([JSON.stringify(content)], { type: 'application/json' }));
  }
  if (url) {
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 0);
    dlFile(url, filename, suffix);
  } else {
    console.warn('Content must be Blob or Object or Array or String');
  }
};

// excel解析文件下载
export const excelReader = (data, filename, suffix) => {
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsText(data,'utf-8');
    fileReader.onload = () => {
      const result = fileReader.result;
      result ? resolve(result) : reject(new Error('文件解析失败'))
    }
  })
    .then(result => {
      if (result && data.type === 'application/json') {
        const { message, code } = JSON.parse(result);
        Message.error(`${code}：${message}`);
        return message
      }
    })
    .then((result) => {
      if (!result) saveFile(data, filename, suffix);
    })
    .catch(err => console.warn(err))
}

// 本地存储
export const local = {
  get: (key, defaultValue = '') => {
    let res = localStorage.getItem(key);
    try {
      res = JSON.parse(res);
    } catch (error) {
      res = res || defaultValue;
    }
    return hasValue(res) ? res : defaultValue;
  },
  set: (key, value = '', defaultValue = '') => {
    try {
      value = basicType(value) ? value : JSON.stringify(value);
    } catch (error) {
      value = defaultValue;
    }
    localStorage.setItem(key, value);
  },
  remove: key => {
    if (key) {
      localStorage.removeItem(key);
    } else {
      localStorage.clear();
    }
  },
};

// 登录状态
let showLoginMessage = false;
export const toLogin = (title, url) => {
  if (showLoginMessage) return;
  showLoginMessage = true;
  MessageBox.alert(title, '提示', {
    confirmButtonText: '跳转',
    showClose: false,
  })
    .then(() => {
      store.commit('setUserName', '');
      window.location.href = url;
    })
    .catch(console.warn)
    .finally(() => {
      showLoginMessage = false;
    });
};

// 本地开发菜单控制，菜单统一vuex管理
export const IS_DEV = process.env.NODE_ENV === 'development'

// 本地菜单控制
export const processDevMenu = (routes) => {
  return routes.map(menu => {
    if (menu.path === '/') return
    if (menu.meta && menu.meta.menu) {
      if (menu.children && menu.children.length) {
        return {
          name: menu.meta.title,
          path: menu.path,
          child: menu.children.map(submenu => {
            if (submenu.meta && submenu.meta.menu) {
              return {
                name: submenu.meta.title,
                path: submenu.path,
              }
            }
          }).filter(item => item)
        }
      }
      return {
        name: menu.meta.title,
        path: menu.path,
      }
    }
  }).filter(item => item)
}

// 生产菜单控制处理
export const processMenu = (menus = [], routes = []) => {
  // 路由过滤
  const pathMap = routes.map(route => route.path);
  if (menus && menus.length) {
    // 处理生产菜单
    const flatMenu = menus.map(menu => {
      if (menu.childNodes && menu.childNodes.length) {
        return [
          menu.path,
          ...menu.childNodes.map(node => node.path)
        ]
      }
      return menu.path
    })
    flatMenu.flat().forEach(pmenu => {
      if (!pathMap.includes(pmenu)) {
        menus.forEach((menu, index) => {
          if (menu.path === pmenu) {
            menus.splice(index, 1)
          } else {
            if (menu.childNodes && menu.childNodes.length) {
              menu.childNodes.map((child, i) => {
                if (child.path === pmenu) {
                  menu.childNodes.splice(i, 1)
                }
              })
            }
          }
        })
      }
    })
    // console.log(menus)
    return menus.map(pmenu => {
      if (pmenu.childNodes && pmenu.childNodes.length) {
        return {
          name: pmenu.name,
          path: pmenu.path,
          child: pmenu.childNodes.map(submenu => {
            return {
              name: submenu.name,
              path: submenu.path,
              child: []
            }
          })
        }
      }
      return {
        name: pmenu.name,
        path: pmenu.path,
        child: []
      }
    })
  }
  return []
}

// 时间差计算(当前时间 - 指定时间)
export const timestamp = (time = '00:00:00') => {
  const now = new Date().getTime();
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const date = new Date().getDate() + 1;
  const zeroTime = new Date(year + '/' + month + '/' + date + ' ' + time).getTime();
  return zeroTime - now
};
// 保存数据为xlsx文件，attrs当data中元素为object时必传，属性name
export const saveXLSXFile = (data, heads, attrs = [], filename, sheetname) => {
  let catesData = [];
  let wsData = [];
  if (!heads && !attrs) {
    wsData = [ data ];
  } else {
    catesData = data.map((item, index) => {
      if (item.constructor === Object) {
        return attrs.map(attr => item[attr]);
      } else if (Array.isArray(item)){
        return [item]
      } else {
        console.warn(`arr[${index}] must be an object`);
        return attrs.map(() => 'Falsy');
      }
    });
    wsData = [
      heads,
      ...catesData,
    ];
  }
  const wsName = sheetname;
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet(wsData, { raw: true });
  xlsx.utils.book_append_sheet(wb, ws, wsName);
  xlsx.writeFile(wb, `${filename}.xlsx`);
};

// 复制文本
export const copyText = async(text) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      const el = document.createElement('textarea');
      el.style = 'width: 0; height: 0; overflow: hidden; margin: 0; padding: 0';
      el.value = typeof text === 'object' ? JSON.stringify(text) : text;
      document.body.appendChild(el);
      el.select();
      el.setSelectionRange(0, el.value.length);
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    Message.success('复制成功');
  } catch (error) {
    Message.warning('复制失败');
    console.warn(error);
  }
};

// 倒计时
export const countdown = (startDate, endDate) => {
  if (!startDate && !endDate) return '';
  if (startDate instanceof Date || typeof startDate === 'string') {
    startDate = Date.parse(startDate);
  }
  if (endDate instanceof Date || typeof endDate === 'string') {
    endDate = Date.parse(endDate);
  }
  if (startDate - endDate > 0) return '';
  const timestamp = endDate - startDate;
  const day = parseInt(timestamp / 1000 / 3600 / 24);
  const hour = parseInt(timestamp / 1000 / 3600 % 24);
  const minute = parseInt(timestamp / 1000 / 60 % 60);
  const second = parseInt(timestamp / 1000 % 60);
  return `${day}${hour}${minute}${second}`
}

// 上传校验
/**
 * fileTypes:文件类型，数组或字符串（逗号分隔）
 * limitSize:文件限制大小，number类型,默认单位b
 * file:文件对象，和url存在一个即可
 * imageRect：图像像素，对象类型{ width, height, minWidth, minHeight, maxWidth, maxHeight }
 * url:图像文件链接，当file不存在时
*/
export const uploadValidate = (fileTypes, limitSize, file, imageRect, url = '') => {
  const types = Array.isArray(fileTypes) ? fileTypes : fileTypes.split(',');
  if (file && !types.includes(file.type)) {
    this.$message.error(`文件类型必须是${types.join(',')}`);
    return Promise.reject(false)
  }
  if (file && (file.size / 1024 > limitSize)) {
    this.$message.error(`大小不得超过${limitSize}k`);
    return Promise.reject(false)
  }
  if (imageRect) {
    const {
      width = '',
      height = '',
      maxWidth = '',
      maxHeight = '',
      minWidth = '',
      minHeight = '',
    } = imageRect;
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = file ? URL.createObjectURL(file) : url;
      image.onload = () => {
        if (width && height) {
          image.width === width && image.height === height ? resolve(true) : reject(false)
          this.$message.error(`图片像素为${width} * ${height}`);
        }
        if (minWidth && minHeight) {
          image.width >= minWidth && image.minHeight >= height ? resolve(true) : reject(false)
          this.$message.error(`图片像素最小为${minWidth} * ${minHeight}`);
        }
        if (maxWidth && maxHeight) {
          image.width <= maxWidth && image.height <= maxHeight ? resolve(true) : reject(false)
          this.$message.error(`图片像素不得超过${maxWidth} * ${maxHeight}`);
        }
      }
    })
  }
  return Promise.resolve(true)
}

//获取当前日期，格式YYYY-MM-DD
export const getNowFormatDay = (nowDate) => {
  var char = "-";
  if(nowDate == null){
      nowDate = new Date();
  }
  var day = nowDate.getDate();
  var month = nowDate.getMonth() + 1; // 注意月份需要+1
  var year = nowDate.getFullYear();
  return year + char + completeDate(month) + char +completeDate(day);
}

// 获取当前时间, 格式YYYY-MM-DD HH:mm:ss
export const getNowFormatTime = () => {
  var nowDate = new Date();
  var colon = ":";
  var h = nowDate.getHours();
  var m = nowDate.getMinutes();
  var s = nowDate.getSeconds();
  return getNowFormatDay(nowDate) + " " + completeDate(h) + colon + completeDate(m) + colon + completeDate(s);
}

export const completeDate = (value) => {
  return value < 10 ? "0"+value:value;
}