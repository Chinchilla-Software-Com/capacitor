# Capacitor CLI

The Capacitor command-line interface should be installed locally and executed through `npm` scripts.

```
npm install @chinchilla-software/capacitor-cli --save-dev
```

This differs from @capacitor/cli only in that you can specify `Configuration` as a parameter when calling build to create `Debug` builds. Currently only supported on Android builds. `Configuration` is already part of the valid parameters in the source package... it's just not utilised when based into sub processes for actual building... it's being ignored in Andoird, but does have a use in IOS.

## Using Capacitor CLI

Consult the Getting Started guide for information on using the CLI and Capacitor scripts.

### License

* [MIT](https://github.com/ionic-team/capacitor/blob/HEAD/LICENSE)
