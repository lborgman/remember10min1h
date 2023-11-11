@setlocal
@pushd ..\..\my-jsmind\jsmind
@rem cd
@rem echo cd=%cd%
@set jsd=%cd%
cmd /c npm run build:dbg
@popd
@rem cd
@echo jsd=%jsd%
set es6d=%jsd%\es6
@echo es6d=%es6d%
@rem dir %es6d%
set extd=public\ext\jsmind\
@rem dir %extd%
copy /-y %es6d%\jsmind-dbg.* %extd%
copy /-y %jsd%\style\jsmind.css %extd%
@rem dir %extd%
