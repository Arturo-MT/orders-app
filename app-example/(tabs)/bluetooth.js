import React, { useState, useEffect, useCallback } from 'react'
import {
  ActivityIndicator,
  DeviceEventEmitter,
  NativeEventEmitter,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  ToastAndroid,
  View,
  Button
} from 'react-native'
import { BluetoothManager } from 'react-native-bluetooth-escpos-printer'
import { PERMISSIONS, requestMultiple, RESULTS } from 'react-native-permissions'

const App = () => {
  const [pairedDevices, setPairedDevices] = useState([])
  const [foundDs, setFoundDs] = useState([])
  const [bleOpend, setBleOpend] = useState(false)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [boundAddress, setBoundAddress] = useState('')

  useEffect(() => {
    BluetoothManager.isBluetoothEnabled().then(
      (enabled) => {
        setBleOpend(Boolean(enabled))
        setLoading(false)
      },
      (err) => {
        setLoading(false)
        console.log(err)
      }
    )

    if (Platform.OS === 'ios') {
      let bluetoothManagerEmitter = new NativeEventEmitter(BluetoothManager)
      bluetoothManagerEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
        (rsp) => {
          deviceAlreadPaired(rsp)
        }
      )
      bluetoothManagerEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_FOUND,
        (rsp) => {
          deviceFoundEvent(rsp)
        }
      )
      bluetoothManagerEmitter.addListener(
        BluetoothManager.EVENT_CONNECTION_LOST,
        () => {
          setName('')
          setBoundAddress('')
        }
      )
    } else if (Platform.OS === 'android') {
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
        (rsp) => {
          deviceAlreadPaired(rsp)
        }
      )
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_FOUND,
        (rsp) => {
          deviceFoundEvent(rsp)
        }
      )
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_CONNECTION_LOST,
        () => {
          setName('')
          setBoundAddress('')
        }
      )
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_BLUETOOTH_NOT_SUPPORT,
        () => {
          ToastAndroid.show('Device Not Support Bluetooth !', ToastAndroid.LONG)
        }
      )
    }

    console.log(pairedDevices.length)
    if (pairedDevices.length < 1) {
      scan()
      console.log('scanning...')
    } else {
      const firstDevice = pairedDevices[0]
      console.log('length  :' + pairedDevices.length)
      console.log(firstDevice)
      connect(firstDevice)

      // connect(firstDevice);
      // console.log(pairedDevices.length + "hello");
    }
  }, [pairedDevices, deviceAlreadPaired, deviceFoundEvent, scan])
  // deviceFoundEvent,pairedDevices,scan,boundAddress
  // boundAddress, deviceAlreadPaired, deviceFoundEvent, pairedDevices, scan

  const deviceAlreadPaired = useCallback(
    (rsp) => {
      var ds = null
      if (typeof rsp.devices === 'object') {
        ds = rsp.devices
      } else {
        try {
          ds = JSON.parse(rsp.devices)
        } catch (e) {
          console.log(e)
          // ignore error
        }
      }
      if (ds && ds.length) {
        let pared = pairedDevices
        if (pared.length < 1) {
          pared = pared.concat(ds || [])
        }
        setPairedDevices(pared)
      }
    },
    [pairedDevices]
  )
  // const deviceAlreadPaired = useCallback(
  //   async rsp => {
  //     try {
  //       var ds = null;
  //       if (typeof rsp.devices === 'object') {
  //         ds = rsp.devices;
  //       } else {
  //         try {
  //           ds = JSON.parse(rsp.devices);
  //         } catch (e) {}
  //       }
  //       if (ds && ds.length) {
  //         let pared = pairedDevices;
  //         if (pared.length < 1) {
  //           pared = pared.concat(ds || []);
  //         }
  //         setPairedDevices(pared);
  //       }
  //     } catch (error) {
  //       // Handle any errors that occurred during the asynchronous operations
  //       console.error(error);
  //     }
  //   },
  //   [pairedDevices],
  // );

  const deviceFoundEvent = useCallback(
    (rsp) => {
      var r = null
      try {
        if (typeof rsp.device === 'object') {
          r = rsp.device
        } else {
          r = JSON.parse(rsp.device)
        }
      } catch (e) {
        console.log(e)
        // ignore error
      }

      if (r) {
        let found = foundDs || []
        if (found.findIndex) {
          let duplicated = found.findIndex(function (x) {
            return x.address === r.address
          })
          if (duplicated === -1) {
            found.push(r)
            setFoundDs(found)
          }
        }
      }
    },
    [foundDs]
  )

  // const connect = (row) => {
  //   setLoading(true);
  //   BluetoothManager.connect(row.address).then(
  //     (s) => {
  //       setLoading(false);
  //       setBoundAddress(row.address);
  //       setName(row.name || "UNKNOWN");
  //       console.log("Connected to device:", row.name);
  //     },
  //     (e) => {
  //       setLoading(false);
  //       alert(e);
  //     }
  //   );
  // };

  const connect = async (row) => {
    try {
      setLoading(true)
      await BluetoothManager.connect(row.address)
      setLoading(false)
      setBoundAddress(row.address)
      setName(row.name || 'UNKNOWN')
      console.log('Connected to device:', row)
    } catch (e) {
      setLoading(false)
      alert(e)
    }
  }

  const scanDevices = useCallback(() => {
    setLoading(true)
    BluetoothManager.scanDevices().then(
      (s) => {
        // const pairedDevices = s.paired;
        var found = s.found
        try {
          found = JSON.parse(found) //@FIX_it: the parse action too weired..
        } catch (e) {
          console.log(e)
          //ignore
        }
        var fds = foundDs
        if (found && found.length) {
          fds = found
        }
        setFoundDs(fds)
        setLoading(false)
      },
      (er) => {
        setLoading(false)
        console.log(er)
        // ignore
      }
    )
  }, [foundDs])

  const scan = useCallback(() => {
    try {
      async function blueTooth() {
        const permissions = {
          title: 'HSD bluetooth meminta izin untuk mengakses bluetooth',
          message:
            'HSD bluetooth memerlukan akses ke bluetooth untuk proses koneksi ke bluetooth printer',
          buttonNeutral: 'Lain Waktu',
          buttonNegative: 'Tidak',
          buttonPositive: 'Boleh'
        }

        const bluetoothConnectGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          permissions
        )
        if (bluetoothConnectGranted === PermissionsAndroid.RESULTS.GRANTED) {
          const bluetoothScanGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            permissions
          )
          if (bluetoothScanGranted === PermissionsAndroid.RESULTS.GRANTED) {
            scanDevices()
          }
        } else {
          // ignore akses ditolak
        }
      }
      blueTooth()
    } catch (err) {
      console.warn(err)
    }
  }, [scanDevices])

  const scanBluetoothDevice = async () => {
    setLoading(true)
    try {
      const request = await requestMultiple([
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      ])

      if (
        request['android.permission.ACCESS_FINE_LOCATION'] === RESULTS.GRANTED
      ) {
        scanDevices()
        setLoading(false)
      } else {
        setLoading(false)
      }
    } catch (err) {
      setLoading(false)
      console.warn(err)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.bluetoothStatusContainer}>
        <Text style={styles.bluetoothStatus(bleOpend ? '#47BF34' : '#A8A9AA')}>
          Bluetooth {bleOpend ? 'Active' : 'Not Active'}
        </Text>
      </View>
      {!bleOpend && (
        <Text style={styles.bluetoothInfo}>Please activate your bluetooth</Text>
      )}
      <Text style={styles.sectionTitle}>
        Printer connected to the application:
      </Text>
      {boundAddress.length > 0 && (
        <View>
          <Text style={styles.pairedDeviceName}>{name}</Text>
        </View>
      )}
      {boundAddress.length < 1 && (
        <Text style={styles.printerInfo}>
          There is no printer connected yet
        </Text>
      )}
      <Text style={styles.sectionTitle}>
        Bluetooth connected to this cellphone:
      </Text>
      {loading ? <ActivityIndicator animating={true} /> : null}
      <View style={styles.containerList}>
        {pairedDevices.map((item, index) => {
          return (
            <View key={index}>
              <Text style={styles.pairedDeviceName}>{item.name}</Text>
            </View>
          )
        })}
      </View>
      <Button onPress={() => scanBluetoothDevice()} title='Scan Bluetooth' />
      <View style={{ height: 100 }} />
    </ScrollView>
  )
}

const styles = {
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ece2d0'
  },
  bluetoothStatusContainer: {
    marginBottom: 10
  },
  bluetoothStatus: (color) => ({
    fontSize: 16,
    color: color
  }),
  bluetoothInfo: {
    fontSize: 14,
    color: '#A8A9AA'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20
  },
  pairedDeviceName: {
    fontSize: 16,
    marginVertical: 5
  },
  printerInfo: {
    fontSize: 14,
    color: '#A8A9AA'
  },
  containerList: {
    marginTop: 10
  }
}

export default App
