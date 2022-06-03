import React, { useState, useMemo, useEffect } from 'react'
import { Form, Button, Selector, Input, DatePicker, Result } from 'antd-mobile'
import './App.css';
import { TIME_INTERVAL_ENUMS, METHODS } from './ constants'
import moment from 'moment'
import { SmileOutline, FrownOutline } from 'antd-mobile-icons'

const PLACEHOLDER_ENUMS = {
  st: '开始时间',
  et: '结束时间'
}

const FORMAT_TYPE = 'YYYY-MM-DD HH:mm:ss'

const App = () => {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [visible, setVisible] = useState(false)
  const [currentPlaceholder, setCurrentPlaceHolder] = useState(PLACEHOLDER_ENUMS['st'])
  const [selectedMethod, setSelectedMethod] = useState('st')
  const [result, setResult] = useState()
  const [frown, setFrown] = useState()
  const [color, setColor] = useState('#1677ff')
  const [now, setNow] = useState(Date.now())

  const [form] = Form.useForm()

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = moment(now).valueOf()
      setNow(currentTime + 1000)
    }, 1000)


    return () => {
      timer && clearInterval(timer)
    }
  }, [now])


  const onFinish = () => {
    form.validateFields().then(() => {
      const { interval, customInterval = 0, method, time } = form.getFieldsValue()
      const _time = moment(time).format(FORMAT_TYPE)
      const _method = method[0]
      let _interval = +interval[0]

      // 采用自定义时间间隔
      if (_interval === 0) {
        _interval = customInterval
      }

      // 已知结束时间求开始时间，时间间隔转为负数
      if (_method === 'st') {
        _interval = ~_interval + 1
      }

      try {
        setFrown(false)
        setColor('#76c6b8')
        setResult(moment(_time).subtract(_interval, 'hour').format(FORMAT_TYPE))
      } catch (e) {
        setColor('#ff3141')
        setResult(undefined)
        setFrown(true)
      }
    })
  }

  const handleIntervalChange = (val) => {
    const newVal = val[0]
    if (newVal === 0) {
      form.setFieldsValue({
        customInterval: undefined
      })
      setShowCustomInput(true)
      return
    }

    setShowCustomInput(false)
  }

  const handleMethodChange = (val) => {
    setCurrentPlaceHolder(PLACEHOLDER_ENUMS[val])
    setSelectedMethod(val)
  }

  const description = useMemo(() => {
    if (frown) {
      return '出现意外的错误，请重试～'
    }

    if (!result) {
      return ''
    }

    const { method, time } = form.getFieldsValue()
    const _time = moment(time).format(FORMAT_TYPE)
    const _method = method?.[0]

    const defalutText = '当前核酸有效时间为：'

    let desc = `${defalutText}${_time} - ${result}`

    if (_method === 'et') {
      desc = `${defalutText}${result} - ${_time}`
    }

    return desc
  }, [form, frown, result])

  const checkCustomInterval = (_, val) => {
    const num = +val

    if (val && (isNaN(num) || typeof num !== 'number')) {
      return Promise.reject(new Error('必须输入数字'))
    }

    return Promise.resolve()
  }


  return (
    <div className="App">
      <div style={{
        backgroundColor: '#1677ff',
        fontSize: '20px',
        color: '#fff',
        padding: '18px',
        fontWeight: 'bold'
      }}>核酸时效计算器</div>
      <div>
        <Form
          form={form}
          initialValues={{ interval: [72], method: ['st'] }}
          onFinish={onFinish}
          footer={
            <Button block type='submit' color='primary' size='large'>
              计算结果
            </Button>
          }
          mode='card'
        >
          <Form.Item name='interval' label='时间间隔' rules={[{ required: true, message: '时间间隔不能为空' }]}>
            <Selector
              columns={2}
              options={TIME_INTERVAL_ENUMS}
              onChange={handleIntervalChange}
            />
          </Form.Item>
          {
            showCustomInput ? <Form.Item
              name='customInterval'
              label='自定义时间间隔'
              rules={[{ required: true }, { validator: checkCustomInterval }]}>
              <Input placeholder='请输入小时数字，例如24' />
            </Form.Item> : null
          }
          <Form.Item name='method' label='计算方式' rules={[{ required: true, message: '计算方式不能为空' }]}>
            <Selector
              columns={2}
              options={METHODS}
              onChange={handleMethodChange}
            />
          </Form.Item>
          {
            selectedMethod ? <Form.Item
              name='time'
              label={currentPlaceholder}
              onClick={() => setVisible(true)}
              trigger="onConfirm"
              rules={[{ required: true, message: '时间不能为空' }]}>
              <DatePicker
                visible={visible}
                onClose={() => {
                  setVisible(false)
                }}
                precision='minute'
              >
                {value =>
                  value ? moment(value).format(FORMAT_TYPE) : `请选择${currentPlaceholder}`
                }
              </DatePicker>
            </Form.Item> : null
          }
        </Form>
      </div>
      <div>
        <Result
          icon={frown ? <FrownOutline style={{ color }} /> : <SmileOutline style={{ color }} />}
          status='success'
          title={result || '暂无'}
          description={description}
        />
        <div style={{ color: '#d9d9d9' }}>
          *当前时间：{moment(now).format(FORMAT_TYPE)}
        </div>
      </div>
    </div>
  );
}

export default App;
