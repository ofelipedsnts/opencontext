---
id: fastf1/python/api-reference
title: FastF1 API Reference (Python)
description: Guia pratico do FastF1 para carregar dados de Formula 1, trabalhar com laps, telemetry e resultados
tags: [fastf1, formula1, python, api, telemetry, laps, f1tv, jolpica, ergast]
lang: [py]
version: "3.8.1"
---

# FastF1 API Reference (Python)

> Use este guia como mapa rapido da API do FastF1 para carregar sessoes, extrair dados de tempo/telemetria e produzir analises.

## Overview

FastF1 expõe uma API Python para acessar dados de Formula 1 com foco em analise e visualizacao. O fluxo tipico comeca em um Event/Session, carrega dados com cache e fornece tabelas pandas para laps, resultados, telemetria e informacoes de circuito. A API inclui utilitarios de plot e integra com o Jolpica-F1 (sucessor do Ergast).

## Quick Start

```python
import fastf1

# Opcional: configure cache para acelerar e reduzir rate limits
fastf1.Cache.enable_cache("/tmp/fastf1-cache")

session = fastf1.get_session(2023, "Bahrain", "Q")
session.load()

laps = session.laps
fastest = laps.pick_fastest()
print(fastest["Driver"], fastest["LapTime"])

telemetry = fastest.get_telemetry().add_distance()
print(telemetry.head())
```

## Key Concepts

Session
- ponto de entrada central para dados de uma sessao (Race, Qualifying, Sprint, Practice)
- chama `Session.load()` para preencher `laps`, `results`, `car_data`, `pos_data`, `weather_data`

EventSchedule / Event
- agenda de eventos por temporada com formatos de fim de semana e sessoes
- baseados em pandas DataFrame/Series

Laps / Lap
- tabela de voltas com tempos, setores, pneus e flags de qualidade

Telemetry
- series temporais multi-canal para dados de carro e posicao

Results
- resultados por piloto e sessao

CircuitInfo
- metadados de circuito (corners, marshal lights, sectors, rotation)

## Reference

### Loading Data
- `fastf1.get_session(year, gp, identifier)` cria `Session`
- `fastf1.get_testing_session(year, test_number, session_number)`
- `fastf1.get_event(year, gp)` cria `Event`
- `fastf1.get_event_schedule(year)` cria `EventSchedule`
- `fastf1.get_events_remaining()` retorna agenda restante
- `fastf1.get_testing_event(year, test_number)`

### Event Schedule
Principais colunas: `RoundNumber`, `Country`, `Location`, `EventName`, `EventFormat`, `Session1..5`, `Session1..5Date`, `F1ApiSupport`.

Formatos de evento:
- `conventional`: FP1, FP2, FP3, Qualifying, Race
- `sprint`: FP1, Qualifying, FP2, Sprint, Race
- `sprint_shootout`: FP1, Qualifying, Sprint Shootout, Sprint, Race
- `sprint_qualifying`: FP1, Sprint Qualifying, Sprint, Qualifying, Race
- `testing`: ordem livre

Identificadores de sessao aceitos:
- abreviacoes: `FP1`, `FP2`, `FP3`, `Q`, `S`, `SS`, `SQ`, `R`
- nomes completos (case-insensitive)
- numeros `1..5`

### Session
Atributos importantes apos `Session.load()`:
- `session.laps`: `Laps`
- `session.results`: `SessionResults`
- `session.car_data` / `session.pos_data`: dict de `Telemetry`
- `session.weather_data`
- `session.session_status`, `session.track_status`, `session.race_control_messages`

Metodos:
- `Session.load(laps=True, telemetry=True, weather=True, messages=True, livedata=None)`
- `Session.get_driver(identifier)` -> `DriverResult`
- `Session.get_circuit_info()` -> `CircuitInfo`

Notas de qualidade:
- dados de laps podem conter voltas geradas pelo FastF1 (ex: abandono)
- `IsAccurate` indica se tempos e setores passaram por checagens basicas

### Timing Data (Laps)
Campos comuns de `Laps`:
- `LapTime`, `Sector1Time`, `Sector2Time`, `Sector3Time`
- `SpeedI1`, `SpeedI2`, `SpeedFL`, `SpeedST`
- `Compound`, `TyreLife`, `FreshTyre`
- `IsPersonalBest`, `Deleted`, `DeletedReason`, `IsAccurate`

### Telemetry
Canais principais:
- Car data: `Speed`, `RPM`, `nGear`, `Throttle`, `Brake`, `DRS`
- Position: `X`, `Y`, `Z`, `Status`
- Time refs: `Time`, `SessionTime`, `Date`, `Source`

Metodos uteis:
- `add_distance()`, `add_relative_distance()`, `add_differential_distance()`
- `merge_channels()`, `resample_channels()`, `fill_missing()`
- `slice_by_lap()`, `slice_by_time()`

Boas praticas:
- evite resampling repetido
- para longas distancias, prefira operar por lap para reduzir erro de integracao

### Results Data
- `SessionResults` agrega resultados de pilotos
- `DriverResult` para um piloto especifico

### Circuit Information
`CircuitInfo` oferece DataFrames com marcadores de pista:
- `corners`, `marshal_lights`, `marshal_sectors`
- `rotation` para alinhar mapa da pista

### Plotting
`fastf1.plotting` fornece nomes, cores e estilos:
- `setup_mpl()` para ajustar matplotlib
- `get_driver_color`, `get_team_color`, `get_driver_style`
- colormaps `fastf1` e `official`

Observacao: cores de pilotos agora sao iguais as cores do time (melhor contraste).

### Jolpica-F1 / Ergast Interface
FastF1 usa Jolpica-F1 como sucessor do Ergast:
- classe principal: `fastf1.ergast.Ergast`
- tipos de resposta: `ErgastRawResponse`, `ErgastSimpleResponse`, `ErgastMultiResponse`
- `result_type`: `raw` ou `pandas`
- `auto_cast` converte strings para tipos adequados

Exemplo basico:
```python
from fastf1.ergast import Ergast
ergast = Ergast()
circuits = ergast.get_circuits(season=2022)
print(circuits.head())
```

### Cache e Rate Limits
- cache habilitado por padrao
- configure com `fastf1.Cache.enable_cache(path)` logo apos imports
- cache em dois niveis: requests brutas + dados parseados
- modos: `offline_mode(True)`, `ci_mode(True)`
- erros de hard limit levantam `RateLimitExceededError`

### Logging
- ajuste com `fastf1.set_log_level("WARNING")`
- `FASTF1_DEBUG=1` desativa catch-all e ajuda em debug

### F1TV Authentication (Live Timing)
- necessario para `livetiming` em tempo real
- autentica via addon do navegador
- CLI: `python -m fastf1 auth f1tv --authenticate|--clear|--status`

### Live Timing Client
Salvar dados durante sessao:
```bash
python -m fastf1.livetiming save saved_data.txt
```

Carregar dados salvos:
```python
from fastf1.livetiming.data import LiveTimingData
livedata = LiveTimingData("saved_data.txt")
session = fastf1.get_testing_session(2021, 1, 1)
session.load(livedata=livedata)
```

Notas:
- evitar misturar dados gravados com dados de API na mesma sessao
- usar cache separado se gravacao e API forem da mesma sessao

### Utils
- `fastf1.utils.delta_time(ref_lap, compare_lap)` (deprecated)
- `fastf1.utils.to_timedelta(str)` e `fastf1.utils.to_datetime(str)`

### Deprecated Legacy API
- `fastf1.api` e `fastf1.legacy` permanecem disponiveis, mas sao legados

## Examples

Selecionar laps de um piloto e plotar velocidade:
```python
import fastf1
from fastf1 import plotting
from matplotlib import pyplot as plt

plotting.setup_mpl()
session = fastf1.get_session(2022, "Monza", "Q")
session.load()

lap = session.laps.pick_driver("VER").pick_fastest()
tel = lap.get_telemetry().add_distance()

fig, ax = plt.subplots()
ax.plot(tel["Distance"], tel["Speed"], color=plotting.get_driver_color("VER", session))
ax.set_xlabel("Distance (m)")
ax.set_ylabel("Speed (km/h)")
plt.show()
```

Buscar agenda da temporada:
```python
import fastf1
schedule = fastf1.get_event_schedule(2024)
print(schedule[["RoundNumber", "EventName", "EventFormat"]].head())
```

## Gotchas and Limitations
- `Session.load()` e necessario antes de acessar `laps`, `results`, `car_data`
- dados antigos (pre-2018) usam Ergast e tem menos detalhe
- `LiveTiming` requer conta F1TV e nao funciona em Colab/Jupyter Lite
- `Telemetry.add_distance()` acumula erro em longos trechos; use por lap
- rate limits podem gerar `RateLimitExceededError` se cache estiver desabilitado

## Sources
- https://docs.fastf1.dev/api_reference/index.html
- https://docs.fastf1.dev/api_reference/loading_data.html
- https://docs.fastf1.dev/api_reference/session.html
- https://docs.fastf1.dev/api_reference/timing_data.html
- https://docs.fastf1.dev/api_reference/telemetry.html
- https://docs.fastf1.dev/api_reference/events.html
- https://docs.fastf1.dev/api_reference/plotting_data.html
- https://docs.fastf1.dev/api_reference/jolpica.html
- https://docs.fastf1.dev/api_reference/cache_and_rate_limits.html
- https://docs.fastf1.dev/api_reference/accounts_auth.html
- https://docs.fastf1.dev/api_reference/livetiming.html
- https://docs.fastf1.dev/api_reference/utils.html
- https://docs.fastf1.dev/api_reference/deprecated_legacy.html

## Related
- `opencontext get fastf1/python/getting-started` (se existir)
