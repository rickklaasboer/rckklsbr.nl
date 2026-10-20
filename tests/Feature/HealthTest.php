<?php

it('serves the health route', fn () => $this->get('/up')->assertOk());
